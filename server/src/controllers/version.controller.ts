import { Response } from 'express';
import prisma from '../lib/prisma';
import { success, page } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';
import { configService } from '../services/config.service';
import { NotFoundError } from '../utils/errors';

export class VersionController {
  async getVersions(req: AuthRequest, res: Response) {
    const { page: pageNum = 1, pageSize = 20, module } = req.query;
    const where: any = {};

    if (module) {
      where.module = module;
    }

    const [total, list] = await Promise.all([
      prisma.configVersion.count({ where }),
      prisma.configVersion.findMany({
        where,
        skip: (parseInt(pageNum as string) - 1) * parseInt(pageSize as string),
        take: parseInt(pageSize as string),
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return page(res, list, total, parseInt(pageNum as string), parseInt(pageSize as string));
  }

  async getVersion(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const version = await prisma.configVersion.findUnique({ where: { id } });

    if (!version) {
      throw new NotFoundError('版本不存在');
    }

    return success(res, version);
  }

  async rollback(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const version = await configService.rollbackToVersion(id, req);
    return success(res, version, '回滚成功');
  }

  async compare(req: AuthRequest, res: Response) {
    const { from, to } = req.query;

    const [fromVersion, toVersion] = await Promise.all([
      prisma.configVersion.findUnique({ where: { id: from as string } }),
      prisma.configVersion.findUnique({ where: { id: to as string } }),
    ]);

    if (!fromVersion || !toVersion) {
      throw new NotFoundError('版本不存在');
    }

    return success(res, {
      from: fromVersion,
      to: toVersion,
    });
  }

  async publish(req: AuthRequest, res: Response) {
    const { module = 'all' } = req.body;
    const result = await configService.publishConfig(module, req);
    return success(res, result, '发布成功');
  }
}

export const versionController = new VersionController();
