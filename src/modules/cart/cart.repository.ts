import { DbClient } from '@src/modules/users/users.repository';

export interface CartItemRecord {
  id: string;
  user_id: string;
  tree_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemWithTree extends CartItemRecord {
  tree_name: string;
  species: string;
  sell_price: string;
  image_url: string | null;
  status: string;
}

export interface AddCartItemInput {
  user_id: string;
  tree_id: string;
  quantity?: number;
}

export class CartRepository {
  constructor(private readonly db: DbClient) {}

  async addItem(input: AddCartItemInput): Promise<CartItemRecord> {
    const query = `
      INSERT INTO cart_items (user_id, tree_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, tree_id)
      DO UPDATE SET
        quantity = cart_items.quantity + EXCLUDED.quantity,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const params = [input.user_id, input.tree_id, input.quantity ?? 1];
    const result = await this.db.query<CartItemRecord>(query, params);
    const item = result.rows[0];
    if (!item) {
      throw new Error('Failed to add item to cart');
    }
    return item;
  }

  async getCartByUserId(userId: string): Promise<CartItemWithTree[]> {
    const result = await this.db.query<CartItemWithTree>(
      `
      SELECT
        ci.*,
        t.name AS tree_name,
        t.species,
        t.sell_price,
        t.image_url,
        t.status
      FROM cart_items ci
      INNER JOIN trees t ON t.id = ci.tree_id
      WHERE ci.user_id = $1
      ORDER BY ci.created_at DESC
      `,
      [userId]
    );
    return result.rows;
  }

  async updateItemQuantity(
    userId: string,
    treeId: string,
    quantity: number
  ): Promise<CartItemRecord | null> {
    const result = await this.db.query<CartItemRecord>(
      `
      UPDATE cart_items
      SET quantity = $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND tree_id = $2
      RETURNING *
      `,
      [userId, treeId, quantity]
    );
    return result.rows[0] ?? null;
  }

  async incrementQuantity(userId: string, treeId: string, amount: number): Promise<CartItemRecord | null> {
    const result = await this.db.query<CartItemRecord>(
      `
      UPDATE cart_items
      SET quantity = quantity + $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND tree_id = $2
      RETURNING *
      `,
      [userId, treeId, amount]
    );
    return result.rows[0] ?? null;
  }

  async decrementQuantity(userId: string, treeId: string, amount: number): Promise<{ item: CartItemRecord | null; removed: boolean }> {
    const result = await this.db.query<CartItemRecord>(
      `
      UPDATE cart_items
      SET quantity = quantity - $3, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND tree_id = $2
      RETURNING *
      `,
      [userId, treeId, amount]
    );

    const item = result.rows[0] ?? null;

    if (item && item.quantity <= 0) {
      await this.db.query(
        'DELETE FROM cart_items WHERE user_id = $1 AND tree_id = $2',
        [userId, treeId]
      );
      return { item, removed: true };
    }

    return { item, removed: false };
  }

  async removeItem(userId: string, treeId: string): Promise<CartItemRecord | null> {
    const result = await this.db.query<CartItemRecord>(
      `
      DELETE FROM cart_items
      WHERE user_id = $1 AND tree_id = $2
      RETURNING *
      `,
      [userId, treeId]
    );
    return result.rows[0] ?? null;
  }

  async clearCart(userId: string): Promise<number> {
    const result = await this.db.query(
      'DELETE FROM cart_items WHERE user_id = $1',
      [userId]
    );
    return result.rowCount ?? 0;
  }
}
