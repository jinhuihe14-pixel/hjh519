import { Router } from 'express';
import { playerController } from '../controllers/player.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', playerController.getPlayers);
router.get('/:id', playerController.getPlayer);
router.post('/compensation', roleMiddleware('admin', 'operator'), playerController.sendCompensation);
router.get('/compensation/records', playerController.getCompensationRecords);

export default router;
