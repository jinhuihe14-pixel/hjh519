import { Router } from 'express';
import authRoutes from './auth.routes';
import levelRoutes from './level.routes';
import itemRoutes from './item.routes';
import eventRoutes from './event.routes';
import checkinRoutes from './checkin.routes';
import playerRoutes from './player.routes';
import versionRoutes from './version.routes';
import reportRoutes from './report.routes';
import gameRoutes from './game.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/levels', levelRoutes);
router.use('/items', itemRoutes);
router.use('/events', eventRoutes);
router.use('/checkin', checkinRoutes);
router.use('/players', playerRoutes);
router.use('/versions', versionRoutes);
router.use('/reports', reportRoutes);
router.use('/game', gameRoutes);

export default router;
