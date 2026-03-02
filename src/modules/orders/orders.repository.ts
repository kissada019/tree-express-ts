import { DbClient } from "@src/modules/users/users.repository";

export interface OrderRecord {
  id: string;
  user_id: string;
  total_price: string;
  final_total: string;
  discount_amount: string;
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
    note?: string,
  ): Promise<OrderWithItems> {
    const orderResult = await this.db.query<OrderRecord>(
      `
      INSERT INTO orders (
        user_id,
        total_price,
        final_total,
        discount_amount,
        status,
        note
      )
      VALUES ($1, $2, $3, $4, 'completed', $5)
      RETURNING *
      `,
      [userId, totalPrice, finalTotal, discountAmount, note ?? null],
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
}
