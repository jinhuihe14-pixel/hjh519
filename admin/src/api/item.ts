import request from './request';

export interface Item {
  id: number;
  name: string;
  type: string;
  icon: string;
  description?: string;
  price: number;
  dailyLimit: number;
  globalDailyLimit: number;
  maxStack: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ItemParams {
  name: string;
  type: string;
  icon: string;
  description?: string;
  price: number;
  dailyLimit?: number;
  globalDailyLimit?: number;
  maxStack?: number;
  status?: string;
}

export interface ItemListResponse {
  items: Item[];
  total: number;
}

export const getItems = (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: string;
}): Promise<ItemListResponse> => {
  return request.get('/items', { params });
};

export const getItem = (id: number): Promise<Item> => {
  return request.get(`/items/${id}`);
};

export const createItem = (data: ItemParams): Promise<Item> => {
  return request.post('/items', data);
};

export const updateItem = (id: number, data: ItemParams): Promise<Item> => {
  return request.put(`/items/${id}`, data);
};

export const deleteItem = (id: number) => {
  return request.delete(`/items/${id}`);
};

export const getItemTypes = (): Promise<string[]> => {
  return request.get('/items/types');
};
