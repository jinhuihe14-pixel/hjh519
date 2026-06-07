import axios from 'axios';

export interface GameConfig {
  version: string;
  updatedAt: string;
  levels: LevelConfig[];
  items: ItemConfig[];
  checkins: CheckinConfig[];
  events: EventConfig[];
}

export interface LevelConfig {
  id: number;
  name: string;
  targetScore: number;
  moves: number;
  obstacles: string[];
  drops: DropConfig[];
}

export interface DropConfig {
  itemId: string;
  rate: number;
  maxDaily: number;
}

export interface ItemConfig {
  id: string;
  name: string;
  icon: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
}

export interface CheckinConfig {
  day: number;
  rewards: any;
  isSpecial: boolean;
  specialName?: string;
}

export interface EventConfig {
  id: string;
  name: string;
  type: string;
  startTime: string;
  endTime: string;
  rules: any;
  rewards: any[];
}

export class ConfigManager {
  private static instance: ConfigManager;
  private config: GameConfig | null = null;
  private apiBase = 'http://localhost:3000/api';

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  async loadConfig(): Promise<GameConfig> {
    try {
      const response = await axios.get(`${this.apiBase}/game/config`);
      this.config = response.data.data;
      this.saveToLocal();
      return this.config;
    } catch (error) {
      console.error('Failed to load config, using local cache');
      return this.loadFromLocal() || this.getDefaultConfig();
    }
  }

  private saveToLocal() {
    if (this.config) {
      localStorage.setItem('game_config', JSON.stringify(this.config));
    }
  }

  private loadFromLocal(): GameConfig | null {
    const cached = localStorage.getItem('game_config');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  }

  private getDefaultConfig(): GameConfig {
    return {
      version: 'default',
      updatedAt: new Date().toISOString(),
      levels: [
        {
          id: 1,
          name: '第一关',
          targetScore: 1000,
          moves: 20,
          obstacles: [],
          drops: [
            { itemId: 'coin', rate: 50, maxDaily: 1000 },
            { itemId: 'gem', rate: 30, maxDaily: 100 },
            { itemId: 'heart', rate: 20, maxDaily: 50 },
          ],
        },
      ],
      items: [
        { id: 'coin', name: '金币', icon: '💰', description: '游戏货币', price: 0, category: 'currency', stock: 99999 },
        { id: 'gem', name: '宝石', icon: '💎', description: '稀有货币', price: 100, category: 'currency', stock: 9999 },
        { id: 'heart', name: '爱心', icon: '❤️', description: '生命值', price: 10, category: 'resource', stock: 999 },
      ],
      checkins: [],
      events: [],
    };
  }

  getConfig(): GameConfig | null {
    return this.config;
  }

  getLevel(levelId: number): LevelConfig | undefined {
    return this.config?.levels.find(l => l.id === levelId);
  }

  getItem(itemId: string): ItemConfig | undefined {
    return this.config?.items.find(i => i.id === itemId);
  }

  getActiveEvents(): EventConfig[] {
    const now = new Date();
    return this.config?.events.filter(e => {
      const start = new Date(e.startTime);
      const end = new Date(e.endTime);
      return now >= start && now <= end;
    }) || [];
  }
}
