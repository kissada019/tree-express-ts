import { DbClient } from "@src/modules/users/users.repository";

export interface OrderRecord {
  id: string;
  user_id: string;
  total_price: string;
  final_total: string;
  discount_amount: string;
  payment_method: string;
  sales_channel: string;
  fulfillment_method: string;
  pickup_date: string | null;
  pickup_time: string | null;
  payment_slip_url: string | null;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItemRecord {
  id: string;
  order_id: string;
  tree_id: string;
  tree_name: string;
  quantity: number;
  unit_price: string;
  subtotal: string;
  created_at: string;
}

export interface OrderWithItems extends OrderRecord {
  items: OrderItemRecord[];
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_review'
  | 'ready_to_ship'
  | 'completed'
  | 'cancelled';

export interface CreateOrderItemInput {
  tree_id: string;
  tree_name: string;
  quantity: number;
  unit_price: number;
}

export class OrdersRepository {
  constructor(private readonly db: DbClient) {}

  async createOrder(
    userId: string,
    items: CreateOrderItemInput[],
    totalPrice: number,
    discountAmount: number,
    finalTotal: number,
    paymentMethod: string,
    salesChannel: string,
    fulfillmentMethod: string,
    pickupDate: string | null,
    pickupTime: string | null,
    status: OrderStatus,
    note?: string,
  ): Promise<OrderWithItems> {
    const orderResult = await this.db.query<OrderRecord>(
      `
      INSERT INTO orders (
        user_id,
        total_price,
        final_total,
        discount_amount,
        payment_method,
        sales_channel,
        fulfillment_method,
        pickup_date,
        pickup_time,
        status,
        note
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
      `,
      [
        userId,
        totalPrice,
        finalTotal,
        discountAmount,
        paymentMethod,
        salesChannel,
        fulfillmentMethod,
        pickupDate,
        pickupTime,
        status,
        note ?? null,
      ],
    );

    const order = orderResult.rows[0];
    if (!order) {
      throw new Error("Failed to create order");
    }

    const orderItems: OrderItemRecord[] = [];
    for (const item of items) {
      const subtotal = item.unit_price * item.quantity;
      const itemResult = await this.db.query<OrderItemRecord>(
        `
        INSERT INTO order_items (order_id, tree_id, tree_name, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `,
        [
          order.id,
          item.tree_id,
          item.tree_name,
          item.quantity,
          item.unit_price,
          subtotal,
        ],
      );
      const orderItem = itemResult.rows[0];
      if (orderItem) {
        orderItems.push(orderItem);
      }
    }

    return { ...order, items: orderItems };
  }

  async findOrdersByUserId(userId: string): Promise<OrderRecord[]> {
    const result = await this.db.query<OrderRecord>(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    );
    return result.rows;
  }

  async findOrdersWithItemsByUserId(userId: string): Promise<OrderWithItems[]> {
    const orders = await this.findOrdersByUserId(userId);
    return this.attachItems(orders);
  }

  async findOrderById(orderId: string): Promise<OrderWithItems | null> {
    const orderResult = await this.db.query<OrderRecord>(
      "SELECT * FROM orders WHERE id = $1",
      [orderId],
    );

    const order = orderResult.rows[0];
    if (!order) {
      return null;
    }

    const itemsResult = await this.db.query<OrderItemRecord>(
      "SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at",
      [orderId],
    );

    return { ...order, items: itemsResult.rows };
  }

  async findAllOrders(): Promise<OrderRecord[]> {
    const result = await this.db.query<OrderRecord>(
      "SELECT * FROM orders ORDER BY created_at DESC",
    );
    return result.rows;
  }

  async findAllOrdersWithItems(): Promise<OrderWithItems[]> {
    const orders = await this.findAllOrders();
    return this.attachItems(orders);
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<OrderRecord | null> {
    const result = await this.db.query<OrderRecord>(
      `
      UPDATE orders
      SET status = $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
      `,
      [orderId, status],
    );
    return result.rows[0] ?? null;
  }

  async updatePaymentSlip(
    orderId: string,
    userId: string,
    paymentSlipUrl: string,
  ): Promise<OrderRecord | null> {
    const result = await this.db.query<OrderRecord>(
      `
      UPDATE orders
      SET payment_slip_url = $3,
          status = 'payment_review',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
        AND user_id = $2
        AND sales_channel = 'online'
      RETURNING *
      `,
      [orderId, userId, paymentSlipUrl],
    );
    return result.rows[0] ?? null;
  }

  private async attachItems(orders: OrderRecord[]): Promise<OrderWithItems[]> {
    if (orders.length === 0) {
      return [];
    }

    const orderIds = orders.map((order) => order.id);
    const itemsResult = await this.db.query<OrderItemRecord>(
      `
      SELECT *
      FROM order_items
      WHERE order_id = ANY($1::uuid[])
      ORDER BY created_at
      `,
      [orderIds],
    );

    const itemsByOrderId = new Map<string, OrderItemRecord[]>();
    for (const item of itemsResult.rows) {
      const items = itemsByOrderId.get(item.order_id) ?? [];
      items.push(item);
      itemsByOrderId.set(item.order_id, items);
    }

    return orders.map((order) => ({
      ...order,
      items: itemsByOrderId.get(order.id) ?? [],
    }));
  }
}
