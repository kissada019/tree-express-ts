import pool from '@src/configs/db.config';
import { TreesRepository } from '@src/modules/trees/trees.repository';
import {
  CreateOrderItemInput,
  OrderRecord,
  OrdersRepository,
  OrderWithItems,
} from './orders.repository';

export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly treesRepository: TreesRepository
  ) {}

  async createDirectOrder(
    userId: string,
    items: { tree_id: string; quantity: number }[],
    totalPrice: number,
    discountAmount: number,
    finalTotal: number,
    note?: string
  ): Promise<OrderWithItems> {
    const orderItems: CreateOrderItemInput[] = [];

    for (const item of items) {
      const tree = await this.treesRepository.findById(item.tree_id);
      if (!tree) {
        throw new Error(`Tree not found: ${item.tree_id}`);
      }
      orderItems.push({
        tree_id: tree.id,
        tree_name: tree.name,
        quantity: item.quantity,
        unit_price: Number(tree.sell_price),
      });
    }

    return this.ordersRepository.createOrder(
      userId,
      orderItems,
      totalPrice,
      discountAmount,
      finalTotal,
      note
    );
  }

  getMyOrders(userId: string): Promise<OrderRecord[]> {
    return this.ordersRepository.findOrdersByUserId(userId);
  }

  getOrderById(orderId: string): Promise<OrderWithItems | null> {
    return this.ordersRepository.findOrderById(orderId);
  }

  getAllOrders(): Promise<OrderRecord[]> {
    return this.ordersRepository.findAllOrders();
  }
}

const ordersRepository = new OrdersRepository(pool);
const treesRepository = new TreesRepository(pool);
export const ordersService = new OrdersService(ordersRepository, treesRepository);
