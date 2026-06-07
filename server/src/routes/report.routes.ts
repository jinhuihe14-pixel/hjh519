import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', reportController.getDashboard);
router.get('/retention', reportController.getRetention);
router.get('/items', reportController.getItemConsumption);
router.get('/ads', reportController.getAdRevenue);

export default router;
