import request from './request';

export interface EventReward {
  itemId: number;
  count: number;
}

export interface GameEvent {
  id: number;
  name: string;
  type: string;
  description: string;
  startTime: string;
  endTime: string;
  status: string;
  isRunning: boolean;
  rules: any;
  createdAt: string;
  updatedAt: string;
}

export interface EventParams {
  name: string;
  type: string;
  description: string;
  startTime: string;
  endTime: string;
  status?: string;
  rules?: any;
}

export interface EventListResponse {
  items: GameEvent[];
  total: number;
}

export const getEvents = (params?: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  status?: string;
}): Promise<EventListResponse> => {
  return request.get('/events', { params });
};

export const getEvent = (id: number): Promise<GameEvent> => {
  return request.get(`/events/${id}`);
};

export const createEvent = (data: EventParams): Promise<GameEvent> => {
  return request.post('/events', data);
};

export const updateEvent = (id: number, data: EventParams): Promise<GameEvent> => {
  return request.put(`/events/${id}`, data);
};

export const deleteEvent = (id: number) => {
  return request.delete(`/events/${id}`);
};

export const toggleEventStatus = (id: number, status: string): Promise<GameEvent> => {
  return request.post(`/events/${id}/status`, { status });
};

export const startEvent = (id: number): Promise<GameEvent> => {
  return request.post(`/events/${id}/start`);
};

export const stopEvent = (id: number): Promise<GameEvent> => {
  return request.post(`/events/${id}/stop`);
};
