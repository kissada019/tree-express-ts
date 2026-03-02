import type { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@errors/app.error';
import { cartService } from '@src/modules/cart/cart.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /cart - ดูตะกร้าของ user ที่ login อยู่
export const getCartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      next(new BadRequestError('User not authenticated'));
      return;
    }

    const items = await cartService.getCart(userId);

    const totalPrice = items.reduce((sum, item) => {
      return sum + Number(item.sell_price) * item.quantity;
    }, 0);

    res.status(200).json({
      items,
      totalItems: items.length,
      totalPrice,
    });
  } catch (error) {
    next(error);
  }
};

// POST /cart - เพิ่มต้นไม้ลงตะกร้า
export const addToCartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      next(new BadRequestError('User not authenticated'));
      return;
    }

    const { tree_id, quantity } = req.body as {
      tree_id?: string;
      quantity?: number;
    };

    if (!tree_id || !UUID_REGEX.test(tree_id)) {
      next(new BadRequestError('Invalid tree_id'));
      return;
    }

    const qty = quantity !== undefined ? Number(quantity) : 1;
    if (Number.isNaN(qty) || qty < 1) {
      next(new BadRequestError('Quantity must be at least 1'));
      return;
    }

    const item = await cartService.addToCart({
      user_id: userId,
      tree_id,
      quantity: qty,
    });

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

// PUT /cart/:treeId - อัพเดทจำนวนในตะกร้า
export const updateCartItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      next(new BadRequestError('User not authenticated'));
      return;
    }

    const treeId = req.params.treeId as string;
    if (!treeId || !UUID_REGEX.test(treeId)) {
      next(new BadRequestError('Invalid tree_id'));
      return;
    }

    const { quantity } = req.body as { quantity?: number };
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty < 1) {
      next(new BadRequestError('Quantity must be at least 1'));
      return;
    }

    const item = await cartService.updateQuantity(userId, treeId, qty);
    if (!item) {
      next(new NotFoundError('Item not found in cart'));
      return;
    }

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

// PATCH /cart/:treeId - เพิ่มหรือลด quantity
export const patchCartItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      next(new BadRequestError('User not authenticated'));
      return;
    }

    const treeId = req.params.treeId as string;
    if (!treeId || !UUID_REGEX.test(treeId)) {
      next(new BadRequestError('Invalid tree_id'));
      return;
    }

    const { action, amount } = req.body as { action?: string; amount?: number };
    if (action !== 'increment' && action !== 'decrement') {
      next(new BadRequestError('action must be "increment" or "decrement"'));
      return;
    }

    const qty = amount !== undefined ? Number(amount) : 1;
    if (Number.isNaN(qty) || qty < 1) {
      next(new BadRequestError('amount must be at least 1'));
      return;
    }

    if (action === 'increment') {
      const item = await cartService.incrementQuantity(userId, treeId, qty);
      if (!item) {
        next(new NotFoundError('Item not found in cart'));
        return;
      }
      res.status(200).json(item);
    } else {
      const { item, removed } = await cartService.decrementQuantity(userId, treeId, qty);
      if (!item) {
        next(new NotFoundError('Item not found in cart'));
        return;
      }
      if (removed) {
        res.status(200).json({ message: 'Item removed from cart (quantity reached 0)', removed: true });
      } else {
        res.status(200).json(item);
      }
    }
  } catch (error) {
    next(error);
  }
};

// DELETE /cart/:treeId - ลบต้นไม้ออกจากตะกร้า
export const removeCartItemController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      next(new BadRequestError('User not authenticated'));
      return;
    }

    const treeId = req.params.treeId as string;
    if (!treeId || !UUID_REGEX.test(treeId)) {
      next(new BadRequestError('Invalid tree_id'));
      return;
    }

    const item = await cartService.removeFromCart(userId, treeId);
    if (!item) {
      next(new NotFoundError('Item not found in cart'));
      return;
    }

    res.status(200).json({ message: 'Item removed from cart', item });
  } catch (error) {
    next(error);
  }
};

// DELETE /cart - ล้างตะกร้าทั้งหมด
export const clearCartController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      next(new BadRequestError('User not authenticated'));
      return;
    }

    const deletedCount = await cartService.clearCart(userId);
    res.status(200).json({ message: 'Cart cleared', deletedCount });
  } catch (error) {
    next(error);
  }
};
