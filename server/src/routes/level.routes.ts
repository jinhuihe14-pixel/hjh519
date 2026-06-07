import { Router } from 'express';
import { levelController } from '../controllers/level.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(levelController.getLevels));
router.get('/:id', asyncHandler(levelController.getLevel));
router.post('/', roleMiddleware('admin', 'planner'), asyncHandler(levelController.createLevel));
router.put('/:id', roleMiddleware('admin', 'planner'), asyncHandler(levelController.updateLevel));
router.delete('/:id', roleMiddleware('admin'), asyncHandler(levelController.deleteLevel));
router.post('/:id/toggle', roleMiddleware('admin', 'planner'), asyncHandler(levelController.toggleLevel));

export default router;
