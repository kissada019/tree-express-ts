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
}
