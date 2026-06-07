import { Router } from 'express';
import { versionController } from '../controllers/version.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(versionController.getVersions));
router.get('/compare', asyncHandler(versionController.compare));
router.get('/:id', asyncHandler(versionController.getVersion));
router.post('/:id/rollback', roleMiddleware('admin'), asyncHandler(versionController.rollback));
router.post('/publish', roleMiddleware('admin', 'planner'), asyncHandler(versionController.publish));

export default router;
