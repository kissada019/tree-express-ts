export interface DbQueryResult<T> {
  rows: T[];
  rowCount?: number;
}

export interface DbClient {
  query<T = unknown>(text: string, params?: unknown[]): Promise<DbQueryResult<T>>;
}

export interface TreeImage {
  id: string;
  tree_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface TreeRecord {
  id: string;
  name: string;
  species: string;
  buy_price: string;
  sell_price: string;
  quantity: number;
  image_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface TreeRecordWithImages extends TreeRecord {
  images: TreeImage[];
}

export interface CreateTreeInput {
  name: string;
  species: string;
  buy_price: number | string;
  sell_price: number | string;
  quantity?: number;
  image_url?: string | null;
  status?: string;
}

export interface UpdateTreeInput {
  name?: string;
  species?: string;
  buy_price?: number | string;
  sell_price?: number | string;
  quantity?: number;
  image_url?: string | null;
  status?: string;
}

export class TreesRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateTreeInput): Promise<TreeRecord> {
    const query = `
      INSERT INTO trees (
        name,
        species,
        buy_price,
        sell_price,
        quantity,
        image_url,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [
      input.name,
      input.species,
      input.buy_price,
      input.sell_price,
      input.quantity ?? 0,
      input.image_url ?? null,
      input.status ?? 'active',
    ];
    const result = await this.db.query<TreeRecord>(query, params);
    const tree = result.rows[0];
    if (!tree) {
      throw new Error('Failed to create tree');
    }
    return tree;
  }

  async findById(id: string): Promise<TreeRecord | null> {
    const result = await this.db.query<TreeRecord>(
      'SELECT * FROM trees WHERE id = $1 and status = $2',
      [id, 'active']
    );
    return result.rows[0] ?? null;
  }

  async findByIdWithImages(id: string): Promise<TreeRecordWithImages | null> {
    const result = await this.db.query<TreeRecordWithImages>(
      `
      SELECT
        t.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', ti.id,
              'tree_id', ti.tree_id,
              'image_url', ti.image_url,
              'display_order', ti.display_order,
              'is_primary', ti.is_primary,
              'created_at', ti.created_at
            )
            ORDER BY ti.display_order ASC
          ) FILTER (WHERE ti.id IS NOT NULL),
          '[]'::json
        ) AS images
      FROM trees t
      LEFT JOIN tree_images ti ON ti.tree_id = t.id
      WHERE t.id = $1 AND t.status = $2
      GROUP BY t.id
      `,
      [id, 'active']
    );
    return result.rows[0] ?? null;
  }

  async findAll(): Promise<TreeRecord[]> {
    const result = await this.db.query<TreeRecord>(
      'SELECT * FROM trees WHERE status = $1 ORDER BY created_at DESC',
      ['active']
    );
    return result.rows;
  }

  async updateById(id: string, input: UpdateTreeInput): Promise<TreeRecord | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let index = 1;

    const addField = (name: string, value: unknown) => {
      if (value !== undefined) {
        fields.push(`${name} = $${index}`);
        values.push(value);
        index += 1;
      }
    };

    addField('name', input.name);
    addField('species', input.species);
    addField('buy_price', input.buy_price);
    addField('sell_price', input.sell_price);
    addField('quantity', input.quantity);
    addField('image_url', input.image_url ?? undefined);
    addField('status', input.status);

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE trees
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;
    const result = await this.db.query<TreeRecord>(query, values);
    return result.rows[0] ?? null;
  }

  async updateQuantityAfterSale(id: string, soldQuantity: number): Promise<TreeRecord | null> {
    const result = await this.db.query<TreeRecord>(
      `
      UPDATE trees
      SET quantity = quantity - $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND quantity >= $2
      RETURNING *
      `,
      [id, soldQuantity]
    );
    return result.rows[0] ?? null;
  }

  async deleteById(id: string): Promise<TreeRecord | null> {
    const result = await this.db.query<TreeRecord>(
      'DELETE FROM trees WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] ?? null;
  }

  // Tree Images Methods
  async addTreeImages(treeId: string, imageUrls: string[]): Promise<TreeImage[]> {
    if (imageUrls.length === 0) {
      return [];
    }

    const values: unknown[] = [];
    const placeholders: string[] = [];
    let index = 1;

    imageUrls.forEach((imageUrl, i) => {
      const isPrimary = i === 0; // First image is primary
      placeholders.push(`($${index}, $${index + 1}, $${index + 2}, $${index + 3})`);
      values.push(treeId, imageUrl, i, isPrimary);
      index += 4;
    });

    const query = `
      INSERT INTO tree_images (tree_id, image_url, display_order, is_primary)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;
    const result = await this.db.query<TreeImage>(query, values);
    return result.rows;
  }

  async getTreeImages(treeId: string): Promise<TreeImage[]> {
    const result = await this.db.query<TreeImage>(
      'SELECT * FROM tree_images WHERE tree_id = $1 ORDER BY display_order ASC',
      [treeId]
    );
    return result.rows;
  }

  async deleteTreeImages(treeId: string): Promise<number> {
    const result = await this.db.query<TreeImage>(
      'DELETE FROM tree_images WHERE tree_id = $1',
      [treeId]
    );
    return result.rowCount ?? 0;
  }

  async deleteTreeImageById(imageId: string): Promise<TreeImage | null> {
    const result = await this.db.query<TreeImage>(
      'DELETE FROM tree_images WHERE id = $1 RETURNING *',
      [imageId]
    );
    return result.rows[0] ?? null;
  }

  async updateImagePrimary(imageId: string, treeId: string): Promise<void> {
    await this.db.query(
      'UPDATE tree_images SET is_primary = false WHERE tree_id = $1',
      [treeId]
    );
    await this.db.query(
      'UPDATE tree_images SET is_primary = true WHERE id = $1',
      [imageId]
    );
  }
}
