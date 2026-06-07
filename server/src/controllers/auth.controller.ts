import { Request, Response } from 'express';
import { success } from '../utils/response';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth.middleware';

export class AuthController {
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    return success(res, result, '登录成功');
  }

  async getCurrentUser(req: AuthRequest, res: Response) {
    return success(res, req.user, '获取成功');
  }

  async logout(req: Request, res: Response) {
    return success(res, null, '登出成功');
  }
}

export const authController = new AuthController();
