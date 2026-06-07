import { Response } from 'express';
import prisma from '../lib/prisma';
import { success, page } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { validationService } from '../services/validation.service';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class LevelController {
  async getLevels(req: AuthRequest, res: Response) {
    const { page: pageNum = 1, pageSize = 20, keyword, enabled } = req.query;
    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword as string } },
        { levelId: parseInt(keyword as string) || undefined },
      ];
    }

    if (enabled !== undefined) {
      where.enabled = enabled === 'true';
    }

    const [total, list] = await Promise.all([
      prisma.level.count({ where }),
      prisma.level.findMany({
        where,
        skip: (parseInt(pageNum as string) - 1) * parseInt(pageSize as string),
        take: parseInt(pageSize as string),
        orderBy: { levelId: 'asc' },
        include: { drops: true },
      }),
    ]);

    return page(res, list, total, parseInt(pageNum as string), parseInt(pageSize as string));
  }

  async getLevel(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const level = await prisma.level.findUnique({
      where: { id: parseInt(id) },
      include: { drops: true },
    });

    if (!level) {
      throw new NotFoundError('关卡不存在');
    }

    return success(res, level);
  }

  async createLevel(req: AuthRequest, res: Response) {
    const { levelId, name, targetScore, moves, obstacles, drops, enabled } = req.body;

    validationService.validateLevel({ levelId, targetScore, moves, drops: drops || [] });

    const existing = await prisma.level.findUnique({ where: { levelId } });
    if (existing) {
      throw new BadRequestError('关卡ID已存在');
    }

    const level = await prisma.level.create({
      data: {
        levelId,
        name,
        targetScore,
        moves,
        obstacles,
        enabled: enabled ?? true,
        drops: drops
          ? {
              create: drops.map((d: any) => ({
                itemId: d.itemId,
                rate: d.rate,
                maxDaily: d.maxDaily,
              })),
            }
          : undefined,
      },
      include: { drops: true },
    });

    return success(res, level, '创建成功');
  }

  async updateLevel(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, targetScore, moves, obstacles, drops, enabled } = req.body;

    const existing = await prisma.level.findUnique({ where: { id: parseInt(id) } });
    if (!existing) {
      throw new NotFoundError('关卡不存在');
    }

    validationService.validateLevel({
      levelId: existing.levelId,
      targetScore,
      moves,
      drops: drops || [],
    });

    const level = await prisma.level.update({
      where: { id: parseInt(id) },
      data: {
        name,
        targetScore,
        moves,
        obstacles,
        enabled,
        drops: drops
          ? {
              deleteMany: {},
              create: drops.map((d: any) => ({
                itemId: d.itemId,
                rate: d.rate,
                maxDaily: d.maxDaily,
              })),
            }
          : undefined,
      },
      include: { drops: true },
    });

    return success(res, level, '更新成功');
  }

  async deleteLevel(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await prisma.level.delete({ where: { id: parseInt(id) } });
    return success(res, null, '删除成功');
  }

  async toggleLevel(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { enabled } = req.body;

    const level = await prisma.level.update({
      where: { id: parseInt(id) },
      data: { enabled },
    });

    return success(res, level, enabled ? '已启用' : '已禁用');
  }
}

export const levelController = new LevelController();
