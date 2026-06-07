import { ValidationError } from '../utils/errors';

export interface LevelValidationData {
  levelId: number;
  targetScore: number;
  moves: number;
  drops: Array<{ itemId: string; rate: number; maxDaily: number }>;
}

export interface EventValidationData {
  startTime: Date;
  endTime: Date;
  rewards: Array<{ itemId: string; amount: number }>;
}

export class ValidationService {
  validateLevel(data: LevelValidationData) {
    const errors: Record<string, string> = {};

    if (data.levelId < 1) {
      errors.levelId = '关卡ID必须大于0';
    }

    if (data.targetScore < 100 || data.targetScore > 100000) {
      errors.targetScore = '目标分数必须在100-100000之间';
    }

    if (data.moves < 5 || data.moves > 100) {
      errors.moves = '步数必须在5-100之间';
    }

    if (data.drops && data.drops.length > 0) {
      const totalRate = data.drops.reduce((sum, d) => sum + d.rate, 0);
      if (Math.abs(totalRate - 100) > 0.01) {
        errors.drops = `掉落概率总和必须等于100%，当前为${totalRate.toFixed(2)}%`;
      }

      data.drops.forEach((drop, index) => {
        if (drop.rate < 0 || drop.rate > 100) {
          errors[`drops[${index}].rate`] = '概率必须在0-100之间';
        }
        if (drop.maxDaily < 0 || drop.maxDaily > 10000) {
          errors[`drops[${index}].maxDaily`] = '单日产出上限必须在0-10000之间';
        }
      });
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors, '关卡配置校验失败');
    }
  }

  validateEvent(data: EventValidationData) {
    const errors: Record<string, string> = {};

    const now = new Date();
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (start >= end) {
      errors.startTime = '开始时间必须早于结束时间';
    }

    const maxDuration = 30 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > maxDuration) {
      errors.endTime = '活动时长不能超过30天';
    }

    if (data.rewards && data.rewards.length > 20) {
      errors.rewards = '单次活动奖励不能超过20种';
    }

    data.rewards?.forEach((reward, index) => {
      if (reward.amount < 1 || reward.amount > 10000) {
        errors[`rewards[${index}].amount`] = '奖励数量必须在1-10000之间';
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors, '活动配置校验失败');
    }
  }

  validateItemPrice(price: number) {
    if (price < 0 || price > 99999) {
      throw new ValidationError({ price: '价格必须在0-99999之间' });
    }
  }
}

export const validationService = new ValidationService();
