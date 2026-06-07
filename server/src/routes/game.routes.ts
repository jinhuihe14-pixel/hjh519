import { Router } from 'express';
import { gameController } from '../controllers/game.controller';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.get('/config', asyncHandler(gameController.getConfig));
router.post('/reward/claim', asyncHandler(gameController.claimReward));
router.post('/level/complete', asyncHandler(gameController.completeLevel));
router.post('/login', asyncHandler(gameController.loginOrRegister));

export default router;
