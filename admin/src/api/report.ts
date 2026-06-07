import request from './request';

export interface RetentionData {
  date: string;
  newUsers: number;
  d1: number;
  d3: number;
  d7: number;
  d14: number;
  d30: number;
}

export interface ItemConsumeData {
  itemName: string;
  totalUsed: number;
  avgUsed: number;
  totalValue: number;
  ratio: number;
}

export interface AdData {
  adName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  ecpm: number;
  revenue: number;
  ratio: number;
}

export const getRetention = (params?: {
  dateRange?: [Date, Date] | null;
}): Promise<RetentionData[]> => {
  return request.get('/reports/retention', { params });
};

export const getRetentionReport = (params?: {
  dateRange?: [Date, Date] | null;
}): Promise<RetentionData[]> => {
  return request.get('/reports/retention', { params });
};

export const getItemReport = (params?: {
  dateRange?: [Date, Date] | null;
}): Promise<ItemConsumeData[]> => {
  return request.get('/reports/items', { params });
};

export const getAdReport = (params?: {
  dateRange?: [Date, Date] | null;
}): Promise<AdData[]> => {
  return request.get('/reports/ads', { params });
};

export const getOverview = (): Promise<any> => {
  return request.get('/reports/overview');
};
