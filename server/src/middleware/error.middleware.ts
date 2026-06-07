import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', err);

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
