import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import {
  createDirectOrderController,
  getOrderItemsByPayloadController,
  getMyOrdersController,
  getOrderByIdController,
} from '@src/modules/orders/orders.controller';

const router = Router();

router.use(authenticateJwt);

router.post('/', createDirectOrderController);
router.get('/items', getOrderItemsByPayloadController);
router.get('/', getMyOrdersController);
router.get('/:id', getOrderByIdController);

export default router;
