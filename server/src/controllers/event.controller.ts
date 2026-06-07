import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { success, page } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { validationService } from '../services/validation.service';
import { NotFoundError, BadRequestError } from '../utils/errors';

export class EventController {
  async getEvents(req: AuthRequest, res: Response) {
    const { page: pageNum = 1, pageSize = 20, keyword, status, type } = req.query;
    const where: any = {};

    if (keyword) {
      where.name = { contains: keyword as string };
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const [total, list] = await Promise.all([
      prisma.gameEvent.count({ where }),
      prisma.gameEvent.findMany({
        where,
        skip: (parseInt(pageNum as string) - 1) * parseInt(pageSize as string),
        take: parseInt(pageSize as string),
        orderBy: { createdAt: 'desc' },
        include: { rewardsDetail: true },
      }),
    ]);

    return page(res, list, total, parseInt(pageNum as string), parseInt(pageSize as string));
  }

  async getEvent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const event = await prisma.gameEvent.findUnique({
      where: { id },
      include: { rewardsDetail: true },
    });

    if (!event) {
      throw new NotFoundError('活动不存在');
    }

    return success(res, event);
  }

  async createEvent(req: AuthRequest, res: Response) {
    const { name, type, startTime, endTime, rules, rewards } = req.body;

    validationService.validateEvent({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      rewards: rewards || [],
    });

    const event = await prisma.gameEvent.create({
      data: {
        id: uuidv4(),
        name,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rules,
        rewards,
        status: 'draft',
        rewardsDetail: rewards
          ? {
              create: rewards.map((r: any) => ({
                itemId: r.itemId,
                amount: r.amount,
              })),
            }
          : undefined,
      },
      include: { rewardsDetail: true },
    });

    return success(res, event, '创建成功');
  }

  async updateEvent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, type, startTime, endTime, rules, rewards, status } = req.body;

    const existing = await prisma.gameEvent.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('活动不存在');
    }

    validationService.validateEvent({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      rewards: rewards || [],
    });

    const event = await prisma.gameEvent.update({
      where: { id },
      data: {
        name,
        type,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        rules,
        rewards,
        status,
        rewardsDetail: rewards
          ? {
              deleteMany: {},
              create: rewards.map((r: any) => ({
                itemId: r.itemId,
                amount: r.amount,
              })),
            }
          : undefined,
      },
      include: { rewardsDetail: true },
    });

    return success(res, event, '更新成功');
  }

  async deleteEvent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await prisma.gameEvent.delete({ where: { id } });
    return success(res, null, '删除成功');
  }

  async startEvent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const event = await prisma.gameEvent.update({
      where: { id },
      data: { status: 'active' },
    });
    return success(res, event, '活动已启动');
  }

  async stopEvent(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const event = await prisma.gameEvent.update({
      where: { id },
      data: { status: 'ended' },
    });
    return success(res, event, '活动已停止');
  }
}

export const eventController = new EventController();
