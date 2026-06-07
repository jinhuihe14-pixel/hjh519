import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import { config } from '../config';
import { AuthRequest } from '../middleware/auth.middleware';

export type ModuleType = 'levels' | 'items' | 'checkin' | 'events' | 'all';

export class ConfigService {
  private outputDir: string;

  constructor() {
    this.outputDir = path.resolve(process.cwd(), config.configOutputDir);
  }

  private async ensureOutputDir() {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  async generateLevelConfig() {
    const levels = await prisma.level.findMany({
      where: { enabled: true },
      include: { drops: true },
    });

    return {
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
    };
  }

  async generateItemConfig() {
    const items = await prisma.item.findMany({
      where: { enabled: true },
    });

    return {
      version: Date.now().toString(),
      updatedAt: new Date().toISOString(),
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        icon: item.icon,
        description: item.description,
        price: item.price,
        category: item.category,
        stock: item.stock,
      })),
    };
  }

  async generateCheckinConfig() {
    const checkins = await prisma.checkinConfig.findMany({
      orderBy: { day: 'asc' },
    });

    return {
      version: Date.now().toString(),
      updatedAt: new Date().toISOString(),
      checkins: checkins.map(c => ({
        day: c.day,
        rewards: c.rewards,
        isSpecial: c.isSpecial,
        specialName: c.specialName,
      })),
    };
  }

  async generateEventConfig() {
    const now = new Date();
    const events = await prisma.gameEvent.findMany({
      where: {
        status: 'active',
        startTime: { lte: now },
        endTime: { gte: now },
      },
      include: { rewardsDetail: true },
    });

    return {
      version: Date.now().toString(),
      updatedAt: new Date().toISOString(),
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
    };
  }

  async generateAllConfig() {
    const [levels, items, checkins, events] = await Promise.all([
      this.generateLevelConfig(),
      this.generateItemConfig(),
      this.generateCheckinConfig(),
      this.generateEventConfig(),
    ]);

    return {
      version: Date.now().toString(),
      updatedAt: new Date().toISOString(),
      levels,
      items,
      checkins,
      events,
    };
  }

  async writeConfig(module: ModuleType, data: any) {
    await this.ensureOutputDir();
    const filePath = path.join(this.outputDir, `${module}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return filePath;
  }

  async saveVersion(module: string, data: any, operator: string) {
    const version = `v${Date.now()}`;
    await prisma.configVersion.create({
      data: {
        id: uuidv4(),
        version,
        module,
        data,
        operator,
      },
    });
    return version;
  }

  async rollbackToVersion(versionId: string, req: AuthRequest) {
    const version = await prisma.configVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) {
      throw new Error('Version not found');
    }

    await this.writeConfig(version.module as ModuleType, version.data);
    await this.saveVersion(version.module, version.data, req.user?.username || 'system');

    return version;
  }

  async publishConfig(module: ModuleType, req: AuthRequest) {
    let configData: any;

    switch (module) {
      case 'levels':
        configData = await this.generateLevelConfig();
        break;
      case 'items':
        configData = await this.generateItemConfig();
        break;
      case 'checkin':
        configData = await this.generateCheckinConfig();
        break;
      case 'events':
        configData = await this.generateEventConfig();
        break;
      case 'all':
        configData = await this.generateAllConfig();
        break;
      default:
        throw new Error('Invalid module');
    }

    const filePath = await this.writeConfig(module, configData);
    const version = await this.saveVersion(module, configData, req.user?.username || 'system');

    return { filePath, version };
  }
}

export const configService = new ConfigService();
