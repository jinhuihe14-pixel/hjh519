import { Router } from 'express';
import { checkinController } from '../controllers/checkin.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', checkinController.getConfigs);
router.get('/:id', checkinController.getConfig);
router.post('/', roleMiddleware('admin', 'planner'), checkinController.createConfig);
router.put('/:id', roleMiddleware('admin', 'planner'), checkinController.updateConfig);
router.delete('/:id', roleMiddleware('admin'), checkinController.deleteConfig);

export default router;
