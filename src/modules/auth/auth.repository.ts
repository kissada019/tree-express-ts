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

  async getRolesByUserId(userId: string): Promise<string[]> {
    const result = await this.db.query<{ name: string }>(
      `
      SELECT r.name
      FROM roles r
      INNER JOIN user_roles ur ON ur.role_id = r.id
      WHERE ur.user_id = $1
      ORDER BY CASE r.name
        WHEN 'superadmin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'user' THEN 3
        ELSE 4
      END, r.name
      `,
      [userId]
    );

    return result.rows.map((row) => row.name);
  }
}
