import { Router } from 'express';
import { itemController } from '../controllers/item.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', itemController.getItems);
router.get('/categories', itemController.getCategories);
router.get('/:id', itemController.getItem);
router.post('/', roleMiddleware('admin', 'planner'), itemController.createItem);
router.put('/:id', roleMiddleware('admin', 'planner'), itemController.updateItem);
router.delete('/:id', roleMiddleware('admin'), itemController.deleteItem);

export default router;
