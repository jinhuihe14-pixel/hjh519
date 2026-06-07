import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);
router.post('/', roleMiddleware('admin', 'planner', 'operator'), eventController.createEvent);
router.put('/:id', roleMiddleware('admin', 'planner', 'operator'), eventController.updateEvent);
router.delete('/:id', roleMiddleware('admin'), eventController.deleteEvent);
router.post('/:id/start', roleMiddleware('admin', 'planner', 'operator'), eventController.startEvent);
router.post('/:id/stop', roleMiddleware('admin', 'planner', 'operator'), eventController.stopEvent);

export default router;
