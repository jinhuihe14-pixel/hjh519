import { Router } from 'express';
import { gameController } from '../controllers/game.controller';

const router = Router();

router.get('/config', gameController.getConfig);
router.post('/reward/claim', gameController.claimReward);
router.post('/level/complete', gameController.completeLevel);
router.post('/login', gameController.loginOrRegister);

export default router;
