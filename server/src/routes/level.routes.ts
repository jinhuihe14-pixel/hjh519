import { Router } from 'express';
import { levelController } from '../controllers/level.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', levelController.getLevels);
router.get('/:id', levelController.getLevel);
router.post('/', roleMiddleware('admin', 'planner'), levelController.createLevel);
router.put('/:id', roleMiddleware('admin', 'planner'), levelController.updateLevel);
router.delete('/:id', roleMiddleware('admin'), levelController.deleteLevel);
router.post('/:id/toggle', roleMiddleware('admin', 'planner'), levelController.toggleLevel);

export default router;
