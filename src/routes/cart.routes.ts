import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import {
  addToCartController,
  clearCartController,
  getCartController,
  patchCartItemController,
  removeCartItemController,
  updateCartItemController,
} from '@src/modules/cart/cart.controller';

const router = Router();

// ทุกเส้นต้อง login ก่อน
router.use(authenticateJwt);

router.get('/', getCartController);
router.post('/', addToCartController);
router.put('/:treeId', updateCartItemController);
router.patch('/:treeId', patchCartItemController);
router.delete('/:treeId', removeCartItemController);
router.delete('/', clearCartController);

export default router;
