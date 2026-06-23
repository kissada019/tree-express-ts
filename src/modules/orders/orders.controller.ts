import type { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@errors/app.error';
import { ordersService } from '@src/modules/orders/orders.service';
import type { OrderStatus } from '@src/modules/orders/orders.repository';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SALES_CHANNELS = new Set(['in_store', 'online']);
const FULFILLMENT_METHODS = new Set(['pickup', 'delivery']);
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_REGEX = /^\d{2}:\d{2}$/;
const ORDER_STATUSES = new Set([
  'pending_payment',
  'payment_review',
  'ready_to_ship',
  'completed',
  'cancelled',
]);

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
      payment_method,
      sales_channel,
      fulfillment_method,
      pickup_date,
      pickup_time,
    } = req.body as {
      items?: { tree_id: string; quantity: number }[];
      note?: string;
      total_price?: number;
      discount_amount?: number;
      final_total?: number;
      final__total?: number;
      payment_method?: string;
      sales_channel?: string;
      fulfillment_method?: string;
      pickup_date?: string;
      pickup_time?: string;
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
    if (typeof payment_method !== 'string' || payment_method.trim().length === 0) {
      next(new BadRequestError('payment_method is required'));
      return;
    }
    const salesChannel =
      typeof sales_channel === 'string' && sales_channel.trim().length > 0
        ? sales_channel.trim()
        : 'in_store';
    if (!SALES_CHANNELS.has(salesChannel)) {
      next(new BadRequestError('sales_channel must be in_store or online'));
      return;
    }
    const fulfillmentMethod =
      typeof fulfillment_method === 'string' && fulfillment_method.trim().length > 0
        ? fulfillment_method.trim()
        : salesChannel === 'online'
          ? 'delivery'
          : 'pickup';
    if (!FULFILLMENT_METHODS.has(fulfillmentMethod)) {
      next(new BadRequestError('fulfillment_method must be pickup or delivery'));
      return;
    }
    const pickupDate =
      typeof pickup_date === 'string' && pickup_date.trim().length > 0
        ? pickup_date.trim()
        : null;
    const pickupTime =
      typeof pickup_time === 'string' && pickup_time.trim().length > 0
        ? pickup_time.trim()
        : null;

    if (fulfillmentMethod === 'pickup' && salesChannel === 'online') {
      if (!pickupDate || !DATE_REGEX.test(pickupDate)) {
        next(new BadRequestError('pickup_date is required for pickup orders'));
        return;
      }
      if (!pickupTime || !TIME_REGEX.test(pickupTime)) {
        next(new BadRequestError('pickup_time is required for pickup orders'));
        return;
      }
    }
    if (pickupDate && !DATE_REGEX.test(pickupDate)) {
      next(new BadRequestError('pickup_date must be YYYY-MM-DD'));
      return;
    }
    if (pickupTime && !TIME_REGEX.test(pickupTime)) {
      next(new BadRequestError('pickup_time must be HH:mm'));
      return;
    }

    const order = await ordersService.createDirectOrder(
      userId,
      items,
      totalPrice,
      discountAmount,
      finalTotal,
      payment_method.trim(),
      salesChannel,
      fulfillmentMethod,
      fulfillmentMethod === 'pickup' ? pickupDate : null,
      fulfillmentMethod === 'pickup' ? pickupTime : null,
      note
    );
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Tree not found')) {
      next(new NotFoundError(error.message));
      return;
    }
    if (error instanceof Error && error.message.startsWith('Insufficient quantity')) {
      next(new BadRequestError(error.message));
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

    const orders = await ordersService.getMyOrdersWithItems(userId);
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /orders/admin/all - เจ้าของร้านดูคำสั่งซื้อทั้งหมด
export const getAllOrdersController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await ordersService.getAllOrdersWithItems();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// PATCH /orders/:id/status - เจ้าของร้านอัปเดตสถานะคำสั่งซื้อ
export const updateOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orderId = req.params.id as string;
    const { status } = req.body as { status?: string };

    if (!orderId || !UUID_REGEX.test(orderId)) {
      next(new BadRequestError('Invalid order id'));
      return;
    }
    if (!status || !ORDER_STATUSES.has(status)) {
      next(new BadRequestError('Invalid order status'));
      return;
    }

    const order = await ordersService.updateOrderStatus(orderId, status as OrderStatus);
    if (!order) {
      next(new NotFoundError('Order not found'));
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// POST /orders/:id/payment-slip - user อัปโหลดสลิปโอนเงิน
export const uploadPaymentSlipController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const orderId = req.params.id as string;
    const uploadedFile = req.file
      ?? (Array.isArray(req.files) ? req.files[0] : undefined);

    if (!userId) {
      next(new BadRequestError('User not authenticated'));
      return;
    }
    if (!orderId || !UUID_REGEX.test(orderId)) {
      next(new BadRequestError('Invalid order id'));
      return;
    }
    if (!uploadedFile) {
      next(new BadRequestError('payment slip image is required'));
      return;
    }

    const paymentSlipUrl = `/uploads/${uploadedFile.filename}`;
    const order = await ordersService.uploadPaymentSlip(orderId, userId, paymentSlipUrl);
    if (!order) {
      next(new NotFoundError('Order not found'));
      return;
    }

    res.status(200).json(order);
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

// GET /orders/items - ดึงรายการ order_items จาก query order_id
export const getOrderItemsByPayloadController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order_id =
      typeof req.query.order_id === 'string' ? req.query.order_id : undefined;

    if (!order_id || !UUID_REGEX.test(order_id)) {
      next(new BadRequestError('Invalid order_id'));
      return;
    }

    const order = await ordersService.getOrderById(order_id);
    if (!order) {
      next(new NotFoundError('Order not found'));
      return;
    }

    res.status(200).json({
      order_id: order.id,
      items: order.items,
    });
  } catch (error) {
    next(error);
  }
};
