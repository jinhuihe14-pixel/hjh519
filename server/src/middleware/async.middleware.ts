import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

type AsyncHandler = (
  req: Request | AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
