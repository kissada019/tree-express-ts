import type { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@errors/app.error';
import { ordersService } from '@src/modules/orders/orders.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// POST /orders - สั่งซื้อตรง
export const createDirectOrderController = async (
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

    const {
      items,
      note,
      total_price,
      discount_amount,
      final_total,
      final__total,
    } = req.body as {
      items?: { tree_id: string; quantity: number }[];
      note?: string;
      total_price?: number;
      discount_amount?: number;
      final_total?: number;
      final__total?: number;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      next(new BadRequestError('items array is required'));
      return;
    }

    for (const item of items) {
      if (!item.tree_id || !UUID_REGEX.test(item.tree_id)) {
        next(new BadRequestError(`Invalid tree_id: ${item.tree_id}`));
        return;
      }
      if (!item.quantity || item.quantity < 1) {
        next(new BadRequestError('quantity must be at least 1'));
        return;
      }
    }

    const totalPrice = Number(total_price);
    const discountAmount = Number(discount_amount ?? 0);
    const finalTotal = Number(final_total ?? final__total);

    if (Number.isNaN(totalPrice) || totalPrice < 0) {
      next(new BadRequestError('total_price must be a number >= 0'));
      return;
    }
    if (Number.isNaN(discountAmount) || discountAmount < 0) {
      next(new BadRequestError('discount_amount must be a number >= 0'));
      return;
    }
    if (Number.isNaN(finalTotal) || finalTotal < 0) {
      next(new BadRequestError('final_total must be a number >= 0'));
      return;
    }

    const order = await ordersService.createDirectOrder(
      userId,
      items,
      totalPrice,
      discountAmount,
      finalTotal,
      note
    );
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Tree not found')) {
      next(new NotFoundError(error.message));
      return;
    }
    next(error);
  }
};

// GET /orders - ดูรายการสั่งซื้อของตัวเอง
export const getMyOrdersController = async (
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

    const orders = await ordersService.getMyOrders(userId);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /orders/:id - ดูรายละเอียดคำสั่งซื้อ
export const getOrderByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id as string;
    if (!orderId || !UUID_REGEX.test(orderId)) {
      next(new BadRequestError('Invalid order id'));
      return;
    }

    const order = await ordersService.getOrderById(orderId);
    if (!order) {
      next(new NotFoundError('Order not found'));
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};
