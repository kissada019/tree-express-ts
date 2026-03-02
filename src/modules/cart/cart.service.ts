import pool from '@src/configs/db.config';
import {
  AddCartItemInput,
  CartItemRecord,
  CartItemWithTree,
  CartRepository,
} from './cart.repository';

export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  addToCart(input: AddCartItemInput): Promise<CartItemRecord> {
    return this.cartRepository.addItem(input);
  }

  getCart(userId: string): Promise<CartItemWithTree[]> {
    return this.cartRepository.getCartByUserId(userId);
  }

  updateQuantity(
    userId: string,
    treeId: string,
    quantity: number
  ): Promise<CartItemRecord | null> {
    return this.cartRepository.updateItemQuantity(userId, treeId, quantity);
  }

  incrementQuantity(userId: string, treeId: string, amount: number): Promise<CartItemRecord | null> {
    return this.cartRepository.incrementQuantity(userId, treeId, amount);
  }

  decrementQuantity(userId: string, treeId: string, amount: number) {
    return this.cartRepository.decrementQuantity(userId, treeId, amount);
  }

  removeFromCart(userId: string, treeId: string): Promise<CartItemRecord | null> {
    return this.cartRepository.removeItem(userId, treeId);
  }

  clearCart(userId: string): Promise<number> {
    return this.cartRepository.clearCart(userId);
  }
}

const cartRepository = new CartRepository(pool);
export const cartService = new CartService(cartRepository);
