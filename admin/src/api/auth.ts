import request from './request';

export interface LoginParams {
  username: string;
  password: string;
}

export interface UserInfo {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export const login = (data: LoginParams): Promise<LoginResponse> => {
  return request.post('/auth/login', data);
};

export const getCurrentUser = (): Promise<UserInfo> => {
  return request.get('/auth/me');
};

export const logout = () => {
  return request.post('/auth/logout');
};
