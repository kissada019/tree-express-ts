export interface DbQueryResult<T> {
  rows: T[];
  rowCount?: number;
}

export interface DbClient {
  query<T = unknown>(text: string, params?: unknown[]): Promise<DbQueryResult<T>>;
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWithRoles extends UserRecord {
  roles: string[];
}

export interface CreateUserInput {
  username: string;
  email: string;
  password_hash: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: boolean;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  password_hash?: string;
  first_name?: string | null;
  last_name?: string | null;
  is_active?: boolean;
}

export class UsersRepository {
  constructor(private readonly db: DbClient) {}

  async create(input: CreateUserInput): Promise<UserRecord> {
    const query = `
      INSERT INTO users (
        username,
        email,
        password_hash,
        first_name,
        last_name,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      input.username,
      input.email,
      input.password_hash,
      input.first_name ?? null,
      input.last_name ?? null,
      input.is_active ?? true,
    ];
    const result = await this.db.query<UserRecord>(query, params);
    const user = result.rows[0];
    if (!user) {
      throw new Error('Failed to create user');
    }
    return user;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.db.query<UserRecord>(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] ?? null;
  }

  async findAll(): Promise<UserWithRoles[]> {
    const result = await this.db.query<UserWithRoles>(
      `
      SELECT
        users.*,
        COALESCE(
          ARRAY_REMOVE(ARRAY_AGG(roles.name ORDER BY roles.name), NULL),
          '{}'
        ) AS roles
      FROM users
      LEFT JOIN user_roles ON user_roles.user_id = users.id
      LEFT JOIN roles ON roles.id = user_roles.role_id
      GROUP BY users.id
      ORDER BY users.created_at DESC
      `
    );
    return result.rows;
  }

  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    await this.db.query(
      'INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
      [roleName]
    );

    await this.db.query(
      `
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id
      FROM roles r
      WHERE r.name = $2
      ON CONFLICT DO NOTHING
      `,
      [userId, roleName]
    );
  }

  async updateById(id: string, input: UpdateUserInput): Promise<UserRecord | null> {
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

    addField('username', input.username);
    addField('email', input.email);
    addField('password_hash', input.password_hash);
    addField('first_name', input.first_name ?? undefined);
    addField('last_name', input.last_name ?? undefined);
    addField('is_active', input.is_active);

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const query = `
      UPDATE users
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `;
    const result = await this.db.query<UserRecord>(query, values);
    return result.rows[0] ?? null;
  }

  async deleteById(id: string): Promise<UserRecord | null> {
    const result = await this.db.query<UserRecord>(
      'DELETE FROM users WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] ?? null;
  }
}
