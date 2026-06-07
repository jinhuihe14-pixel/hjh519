import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.post('/login', asyncHandler(authController.login));
router.get('/me', authMiddleware, asyncHandler(authController.getCurrentUser));
router.post('/logout', authMiddleware, asyncHandler(authController.logout));

export default router;
