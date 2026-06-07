import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', asyncHandler(reportController.getDashboard));
router.get('/retention', asyncHandler(reportController.getRetention));
router.get('/items', asyncHandler(reportController.getItemConsumption));
router.get('/ads', asyncHandler(reportController.getAdRevenue));

export default router;
