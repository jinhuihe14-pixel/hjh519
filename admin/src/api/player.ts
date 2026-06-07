import request from './request';

export interface Player {
  id: string;
  nickname: string;
  avatar: string;
  level: number;
  coins: number;
  hearts: number;
  platform: string;
  lastLogin: string;
  createdAt: string;
}

export interface Compensation {
  id: number;
  playerId: string;
  playerName: string;
  items: string;
  reason: string;
  operator: string;
  createdAt: string;
}

export interface PlayerListResponse {
  items: Player[];
  total: number;
}

export interface CompensationListResponse {
  items: Compensation[];
  total: number;
}

export interface CompensationParams {
  playerId: string;
  items: Array<{ itemId: number; count: number }>;
  reason: string;
}

export const getPlayers = (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  platform?: string;
}): Promise<PlayerListResponse> => {
  return request.get('/players', { params });
};

export const getPlayer = (id: string): Promise<Player> => {
  return request.get(`/players/${id}`);
};

export const updatePlayer = (id: string, data: any): Promise<Player> => {
  return request.put(`/players/${id}`, data);
};

export const getCompensationRecords = (params?: {
  page?: number;
  pageSize?: number;
  playerId?: string;
}): Promise<CompensationListResponse> => {
  return request.get('/players/compensation', { params });
};

export const createCompensation = (data: CompensationParams): Promise<Compensation> => {
  return request.post('/players/compensation', data);
};

export const adjustPlayerAssets = (id: string, data: { coins?: number; hearts?: number; items?: any[] }): Promise<any> => {
  return request.post(`/players/${id}/adjust`, data);
};
