import request from './request';

export interface CheckinReward {
  day: number;
  items: Array<{
    itemId: number;
    itemName: string;
    count: number;
    icon: string;
  }>;
}

export interface CheckinConfig {
  enabled: boolean;
  days: number;
  rewards: CheckinReward[];
  updatedAt: string;
}

export interface CheckinConfigInput {
  enabled: boolean;
  days: number;
  rewards: CheckinReward[];
}

export const getCheckinConfig = (): Promise<CheckinConfig> => {
  return request.get('/checkin/config');
};

export const saveCheckinConfig = (data: CheckinConfigInput): Promise<CheckinConfig> => {
  return request.post('/checkin/config', data);
};
