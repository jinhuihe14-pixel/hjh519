import { Router } from 'express';
import { checkinController } from '../controllers/checkin.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(checkinController.getConfigs));
router.get('/:id', asyncHandler(checkinController.getConfig));
router.post('/', roleMiddleware('admin', 'planner'), asyncHandler(checkinController.createConfig));
router.put('/:id', roleMiddleware('admin', 'planner'), asyncHandler(checkinController.updateConfig));
router.delete('/:id', roleMiddleware('admin'), asyncHandler(checkinController.deleteConfig));

export default router;
