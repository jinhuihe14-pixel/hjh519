import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { success } from '../utils/response';
import { BadRequestError, NotFoundError } from '../utils/errors';

export class GameController {
  async getConfig(req: Request, res: Response) {
    const levels = await prisma.level.findMany({
      where: { enabled: true },
      include: { drops: true },
    });

    const items = await prisma.item.findMany({
      where: { enabled: true },
    });

    const checkins = await prisma.checkinConfig.findMany({
      orderBy: { day: 'asc' },
    });

    const now = new Date();
    const events = await prisma.gameEvent.findMany({
      where: {
        status: 'active',
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: { rewardsDetail: true },
    });

    return success(res, {
      version: Date.now().toString(),
      updatedAt: new Date().toISOString(),
      levels: levels.map(level => ({
        id: level.levelId,
        name: level.name,
        targetScore: level.targetScore,
        moves: level.moves,
        obstacles: level.obstacles || [],
        drops: level.drops.map(drop => ({
          itemId: drop.itemId,
          rate: drop.rate,
          maxDaily: drop.maxDaily,
        })),
      })),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        description: item.description,
        price: item.price,
        category: item.category,
        stock: item.stock,
      })),
      checkins: checkins.map(c => ({
        day: c.day,
        rewards: c.rewards,
        isSpecial: c.isSpecial,
        specialName: c.specialName,
      })),
      events: events.map(event => ({
        id: event.id,
        name: event.name,
        type: event.type,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime.toISOString(),
        rules: event.rules,
        rewards: event.rewardsDetail.map(r => ({
          itemId: r.itemId,
          amount: r.amount,
        })),
      })),
    });
  }

  async claimReward(req: Request, res: Response) {
    const { playerId, eventId, rewardType } = req.body;

    let player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      throw new NotFoundError('玩家不存在');
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (rewardType === 'event') {
      const event = await prisma.gameEvent.findUnique({
        where: { id: eventId },
        include: { rewardsDetail: true },
      });

      if (!event || event.status !== 'active') {
        throw new BadRequestError('活动无效或已结束');
      }

      if (now < event.startTime || now > event.endTime) {
        throw new BadRequestError('活动不在有效期内');
      }

      const currentItems = (player.items as Record<string, number>) || {};
      event.rewardsDetail.forEach(reward => {
        currentItems[reward.itemId] = (currentItems[reward.itemId] || 0) + reward.amount;
      });

      player = await prisma.player.update({
        where: { id: playerId },
        data: { items: currentItems },
      });

      return success(res, { player, rewards: event.rewardsDetail }, '领取成功');
    }

    throw new BadRequestError('无效的奖励类型');
  }

  async completeLevel(req: Request, res: Response) {
    const { playerId, levelId, score, earnedItems } = req.body;

    let player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) {
      throw new NotFoundError('玩家不存在');
    }

    const level = await prisma.level.findUnique({
      where: { levelId: parseInt(levelId) },
      include: { drops: true },
    });

    if (!level) {
      throw new BadRequestError('关卡不存在');
    }

    if (score < level.targetScore) {
      throw new BadRequestError('分数未达到目标');
    }

    const currentItems = (player.items as Record<string, number>) || {};
    if (earnedItems) {
      Object.entries(earnedItems).forEach(([itemId, count]) => {
        currentItems[itemId] = (currentItems[itemId] || 0) + (count as number);
      });
    }

    player = await prisma.player.update({
      where: { id: playerId },
      data: {
        items: currentItems,
        level: Math.max(player.level, levelId + 1),
      },
    });

    return success(res, { player, earnedItems }, '关卡完成');
  }

  async loginOrRegister(req: Request, res: Response) {
    const { playerId, name } = req.body;

    let player = await prisma.player.findUnique({ where: { id: playerId } });

    if (!player) {
      player = await prisma.player.create({
        data: {
          id: playerId || uuidv4(),
          name: name || `玩家${Math.floor(Math.random() * 10000)}`,
          level: 1,
          items: {},
        },
      });
    }

    return success(res, player, '登录成功');
  }
}

export const gameController = new GameController();
