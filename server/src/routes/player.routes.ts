import { Router } from 'express';
import { playerController } from '../controllers/player.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(playerController.getPlayers));
router.get('/:id', asyncHandler(playerController.getPlayer));
router.post('/compensation', roleMiddleware('admin', 'operator'), asyncHandler(playerController.sendCompensation));
router.get('/compensation/records', asyncHandler(playerController.getCompensationRecords));

export default router;
