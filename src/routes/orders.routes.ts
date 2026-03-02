import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import {
  createDirectOrderController,
  getMyOrdersController,
  getOrderByIdController,
} from '@src/modules/orders/orders.controller';

const router = Router();

router.use(authenticateJwt);

router.post('/', createDirectOrderController);
router.get('/', getMyOrdersController);
router.get('/:id', getOrderByIdController);

export default router;
