import { Response } from 'express';
import prisma from '../lib/prisma';
import { success } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotFoundError } from '../utils/errors';

export class CheckinController {
  async getConfigs(req: AuthRequest, res: Response) {
    const configs = await prisma.checkinConfig.findMany({
      orderBy: { day: 'asc' },
    });
    return success(res, configs);
  }

  async getConfig(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const config = await prisma.checkinConfig.findUnique({
      where: { id: parseInt(id) },
    });

    if (!config) {
      throw new NotFoundError('配置不存在');
    }

    return success(res, config);
  }

  async createConfig(req: AuthRequest, res: Response) {
    const { day, rewards, isSpecial, specialName } = req.body;

    const existing = await prisma.checkinConfig.findUnique({ where: { day } });
    if (existing) {
      throw new NotFoundError('该日期配置已存在');
    }

    const config = await prisma.checkinConfig.create({
      data: {
        day,
        rewards,
        isSpecial: isSpecial || false,
        specialName,
      },
    });

    return success(res, config, '创建成功');
  }

  async updateConfig(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { day, rewards, isSpecial, specialName } = req.body;

    const config = await prisma.checkinConfig.update({
      where: { id: parseInt(id) },
      data: {
        day,
        rewards,
        isSpecial,
        specialName,
      },
    });

    return success(res, config, '更新成功');
  }

  async deleteConfig(req: AuthRequest, res: Response) {
    const { id } = req.params;
    await prisma.checkinConfig.delete({ where: { id: parseInt(id) } });
    return success(res, null, '删除成功');
  }
}

export const checkinController = new CheckinController();
