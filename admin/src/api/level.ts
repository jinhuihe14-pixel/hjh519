import request from './request';

export interface LevelDrop {
  itemId: string;
  rate: number;
  maxDaily: number;
}

export interface Level {
  id: number;
  levelNo: number;
  name: string;
  difficulty: string;
  targetScore: number;
  moves: number;
  rewardCoins: number;
  rewardItems: any[];
  status: string;
  config: any;
  createdAt: string;
  updatedAt: string;
}

export interface LevelParams {
  levelNo: number;
  name: string;
  difficulty: string;
  targetScore: number;
  moves: number;
  rewardCoins: number;
  rewardItems?: any[];
  status?: string;
  config?: any;
}

export interface LevelListResponse {
  items: Level[];
  total: number;
}

export const getLevels = (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  difficulty?: string;
  status?: string;
}): Promise<LevelListResponse> => {
  return request.get('/levels', { params });
};

export const getLevel = (id: number): Promise<Level> => {
  return request.get(`/levels/${id}`);
};

export const createLevel = (data: LevelParams): Promise<Level> => {
  return request.post('/levels', data);
};

export const updateLevel = (id: number, data: LevelParams): Promise<Level> => {
  return request.put(`/levels/${id}`, data);
};

export const deleteLevel = (id: number) => {
  return request.delete(`/levels/${id}`);
};

export const toggleLevel = (id: number, status: string): Promise<Level> => {
  return request.post(`/levels/${id}/toggle`, { status });
};
