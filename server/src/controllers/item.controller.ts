import { Response } from 'express';
import prisma from '../lib/prisma';
import { success, page } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotFoundError } from '../utils/errors';
import { validationService } from '../services/validation.service';

export class ItemController {
  async getItems(req: AuthRequest, res: Response) {
    const { page: pageNum = 1, pageSize = 20, keyword, category, enabled } = req.query;
    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword as string } },
        { id: { contains: keyword as string } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (enabled !== undefined) {
      where.enabled = enabled === 'true';
    }

    const [total, list] = await Promise.all([
      prisma.item.count({ where }),
      prisma.item.findMany({
        where,
        skip: (parseInt(pageNum as string) - 1) * parseInt(pageSize as string),
        take: parseInt(pageSize as string),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return page(res, list, total, parseInt(pageNum as string), parseInt(pageSize as string));
  }

  async getItem(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      throw new NotFoundError('道具不存在');
    }

    return success(res, item);
  }

  async createItem(req: AuthRequest, res: Response) {
    const { id, name, icon, description, price, stock, category, enabled } = req.body;

    validationService.validateItemPrice(price);

    const item = await prisma.item.create({
      data: {
        id,
        name,
        icon,
        description,
        price,
        stock: stock || 0,
        category,
        enabled: enabled ?? true,
      },
    });

    return success(res, item, '创建成功');
  }

  async updateItem(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, icon, description, price, stock, category, enabled } = req.body;

    validationService.validateItemPrice(price);

    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        icon,
        description,
        price,
        stock,
        category,
        enabled,
      },
    });

    return success(res, item, '更新成功');
  }

  async deleteItem(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await prisma.item.delete({ where: { id } });
    return success(res, null, '删除成功');
  }

  async getCategories(req: AuthRequest, res: Response) {
    const categories = await prisma.item.findMany({
      distinct: ['category'],
      select: { category: true },
    });

    return success(res, categories.map(c => c.category));
  }
}

export const itemController = new ItemController();
