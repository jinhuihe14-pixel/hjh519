import { Router } from 'express';
import { versionController } from '../controllers/version.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', versionController.getVersions);
router.get('/compare', versionController.compare);
router.get('/:id', versionController.getVersion);
router.post('/:id/rollback', roleMiddleware('admin'), versionController.rollback);
router.post('/publish', roleMiddleware('admin', 'planner'), versionController.publish);

export default router;
