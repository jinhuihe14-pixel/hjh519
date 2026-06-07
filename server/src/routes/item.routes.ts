import { Router } from 'express';
import { itemController } from '../controllers/item.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../middleware/async.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(itemController.getItems));
router.get('/categories', asyncHandler(itemController.getCategories));
router.get('/:id', asyncHandler(itemController.getItem));
router.post('/', roleMiddleware('admin', 'planner'), asyncHandler(itemController.createItem));
router.put('/:id', roleMiddleware('admin', 'planner'), asyncHandler(itemController.updateItem));
router.delete('/:id', roleMiddleware('admin'), asyncHandler(itemController.deleteItem));

export default router;
