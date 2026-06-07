import { Response } from 'express';
import prisma from '../lib/prisma';
import { success } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

export class ReportController {
  async getDashboard(req: AuthRequest, res: Response) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [todayStats, dauTrend, topItems] = await Promise.all([
      prisma.dailyStat.findFirst({
        where: { date: today },
      }),
      prisma.dailyStat.findMany({
        where: { date: { gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } },
        orderBy: { date: 'asc' },
        take: 7,
      }),
      prisma.itemConsumption.findMany({
        where: { date: { gte: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) } },
        orderBy: { count: 'desc' },
        take: 5,
      }),
    ]);

    return success(res, {
      todayStats,
      dauTrend,
      topItems,
    });
  }

  async getRetention(req: AuthRequest, res: Response) {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate as string) };
    }

    const data = await prisma.dailyStat.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });

    return success(res, data);
  }

  async getItemConsumption(req: AuthRequest, res: Response) {
    const { startDate, endDate, itemId } = req.query;

    const where: any = {};
    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate as string) };
    }
    if (itemId) {
      where.itemId = itemId;
    }

    const data = await prisma.itemConsumption.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 50,
    });

    return success(res, data);
  }

  async getAdRevenue(req: AuthRequest, res: Response) {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate) {
      where.date = { ...where.date, gte: new Date(startDate as string) };
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate as string) };
    }

    const data = await prisma.dailyStat.findMany({
      where,
      select: {
        date: true,
        adRevenue: true,
      },
      orderBy: { date: 'desc' },
      take: 30,
    });

    return success(res, data);
  }
}

export const reportController = new ReportController();
