import { Response } from 'express';

interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export function success<T>(res: Response, data: T, message: string = 'Success'): Response<ApiResponse<T>> {
  return res.json({
    code: 0,
    message,
    data,
  });
}

export function error(
  res: Response,
  code: number,
  message: string,
  errors?: Record<string, string>
): Response<ApiResponse> {
  return res.status(code >= 100 && code < 600 ? code : 500).json({
    code: code,
    message,
    errors,
  });
}

export function page<T>(
  res: Response,
  list: T[],
  total: number,
  page: number,
  pageSize: number,
  message: string = 'Success'
): Response<ApiResponse<{ list: T[]; total: number; page: number; pageSize: number }>> {
  return res.json({
    code: 0,
    message,
    data: {
      list,
      total,
      page,
      pageSize,
    },
  });
}
