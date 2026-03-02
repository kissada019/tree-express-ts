import { DbClient, UserRecord } from '@src/modules/users/users.repository';

export class AuthRepository {
  constructor(private readonly db: DbClient) {}

  async findByUsername(username: string): Promise<UserRecord | null> {
    const result = await this.db.query<UserRecord>(
      `
      SELECT *
      FROM users
      WHERE username = $1
      LIMIT 1
      `,
      [username]
    );

    return result.rows[0] ?? null;
  }

  async getRoleByUserId(userId: string): Promise<string> {
    const result = await this.db.query<{ name: string }>(
      `
      SELECT r.name
      FROM roles r
      INNER JOIN user_roles ur ON ur.role_id = r.id
      WHERE ur.user_id = $1
      ORDER BY r.name
      LIMIT 1
      `,
      [userId]
    );

    return result.rows[0]?.name ?? 'user';
  }
}
