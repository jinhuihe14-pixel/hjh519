import request from './request';

export interface ConfigVersion {
  id: number;
  version: string;
  type: string;
  description: string;
  operator: string;
  isPublished: boolean;
  config: any;
  createdAt: string;
}

export interface VersionListResponse {
  items: ConfigVersion[];
  total: number;
}

export const getConfigVersions = (params?: {
  page?: number;
  pageSize?: number;
  type?: string;
  operator?: string;
}): Promise<VersionListResponse> => {
  return request.get('/config/versions', { params });
};

export const getConfigVersion = (id: number): Promise<ConfigVersion> => {
  return request.get(`/config/versions/${id}`);
};

export const rollbackConfig = (id: number): Promise<any> => {
  return request.post(`/config/versions/${id}/rollback`);
};

export const publishConfig = (type: string): Promise<any> => {
  return request.post('/config/publish', { type });
};

export const getPublishedConfig = (type: string): Promise<any> => {
  return request.get(`/config/published/${type}`);
};
