import { Response } from 'express';
import prisma from '../lib/prisma';
import { success, page } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotFoundError } from '../utils/errors';

export class PlayerController {
  async getPlayers(req: AuthRequest, res: Response) {
    const { page: pageNum = 1, pageSize = 20, keyword } = req.query;
    const where: any = {};

    if (keyword) {
      where.OR = [
        { name: { contains: keyword as string } },
        { id: { contains: keyword as string } },
      ];
    }

    const [total, list] = await Promise.all([
      prisma.player.count({ where }),
      prisma.player.findMany({
        where,
        skip: (parseInt(pageNum as string) - 1) * parseInt(pageSize as string),
        take: parseInt(pageSize as string),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return page(res, list, total, parseInt(pageNum as string), parseInt(pageSize as string));
  }

  async getPlayer(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const player = await prisma.player.findUnique({ where: { id } });

    if (!player) {
      throw new NotFoundError('玩家不存在');
    }

    return success(res, player);
  }

  async sendCompensation(req: AuthRequest, res: Response) {
    const { playerId, rewards, reason } = req.body;

    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      throw new NotFoundError('玩家不存在');
    }

    const compensation = await prisma.compensation.create({
      data: {
        playerId,
        rewards,
        reason,
        operator: req.user?.username || 'system',
      },
    });

    return success(res, compensation, '补发成功');
  }

  async getCompensationRecords(req: AuthRequest, res: Response) {
    const { page: pageNum = 1, pageSize = 20, playerId } = req.query;
    const where: any = {};

    if (playerId) {
      where.playerId = playerId;
    }

    const [total, list] = await Promise.all([
      prisma.compensation.count({ where }),
      prisma.compensation.findMany({
        where,
        skip: (parseInt(pageNum as string) - 1) * parseInt(pageSize as string),
        take: parseInt(pageSize as string),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return page(res, list, total, parseInt(pageNum as string), parseInt(pageSize as string));
  }
}

export const playerController = new PlayerController();
