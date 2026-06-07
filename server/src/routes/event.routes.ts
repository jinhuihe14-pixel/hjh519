import { Router } from 'express';
import { eventController } from '../controllers/event.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(eventController.getEvents));
router.get('/:id', asyncHandler(eventController.getEvent));
router.post('/', roleMiddleware('admin', 'planner', 'operator'), asyncHandler(eventController.createEvent));
router.put('/:id', roleMiddleware('admin', 'planner', 'operator'), asyncHandler(eventController.updateEvent));
router.delete('/:id', roleMiddleware('admin'), asyncHandler(eventController.deleteEvent));
router.post('/:id/start', roleMiddleware('admin', 'planner', 'operator'), asyncHandler(eventController.startEvent));
router.post('/:id/stop', roleMiddleware('admin', 'planner', 'operator'), asyncHandler(eventController.stopEvent));

export default router;
