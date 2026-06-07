import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError, NotFoundError, BadRequestError } from '../utils/errors';

interface PrismaError extends Error {
  code?: string;
  meta?: any;
  clientVersion?: string;
}

function isPrismaError(err: Error): err is PrismaError {
  return (
    err.name?.startsWith('Prisma') ||
    (err as any).code?.startsWith('P') ||
    (err as any).clientVersion !== undefined
  );
}

function handlePrismaError(err: PrismaError): AppError {
  switch (err.code) {
    case 'P2002':
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(', ')
        : 'record';
      return new BadRequestError(`唯一约束冲突: ${target} 已存在`);
    case 'P2025':
      return new NotFoundError('记录不存在或已被删除');
    case 'P2003':
      return new BadRequestError('外键约束失败: 关联记录不存在');
    case 'P2014':
      return new BadRequestError('关系约束违反: 无法执行此操作');
    default:
      if (err.name === 'PrismaClientValidationError') {
        return new BadRequestError('请求参数错误');
      }
      if (err.name === 'PrismaClientInitializationError') {
        return new AppError('数据库连接失败', 500);
      }
      return new AppError('数据库操作失败', 500);
  }
}

export function errorHandler(
  err: Error | PrismaError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(`[${new Date().toISOString()}] Error on ${req.method} ${req.path}:`, err.message);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
    });
  }

  if (isPrismaError(err as Error)) {
    const appErr = handlePrismaError(err as PrismaError);
    return res.status(appErr.statusCode).json({
      code: appErr.statusCode,
      message: appErr.message,
    });
  }

  return res.status(500).json({
    code: 500,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  res.status(404).json({
    code: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
}
