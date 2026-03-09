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
    const stockUpdates: { tree_id: string; quantity: number; tree_name: string }[] = [];

    for (const item of items) {
      const tree = await this.treesRepository.findById(item.tree_id);
      if (!tree) {
        throw new Error(`Tree not found: ${item.tree_id}`);
      }
      if (item.quantity > tree.quantity) {
        throw new Error(`Insufficient quantity for tree: ${tree.name}`);
      }
      orderItems.push({
        tree_id: tree.id,
        tree_name: tree.name,
        quantity: item.quantity,
        unit_price: Number(tree.sell_price),
      });
      stockUpdates.push({
        tree_id: tree.id,
        quantity: item.quantity,
        tree_name: tree.name,
      });
    }

    const order = await this.ordersRepository.createOrder(
      userId,
      orderItems,
      totalPrice,
      discountAmount,
      finalTotal,
      note
    );

    for (const item of stockUpdates) {
      const updatedTree = await this.treesRepository.updateQuantityAfterSale(
        item.tree_id,
        item.quantity
      );
      if (!updatedTree) {
        throw new Error(`Insufficient quantity for tree: ${item.tree_name}`);
      }
    }

    return order;
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
