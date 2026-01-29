import { DbClient, UserRecord } from '@src/modules/users/users.repository';

export class AdminRepository {
    constructor(private readonly db: DbClient) { }

    async listUsers(): Promise<UserRecord[]> {
        const result = await this.db.query<UserRecord>(
            'SELECT * FROM users ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async findUserById(id: string): Promise<UserRecord | null> {
        const result = await this.db.query<UserRecord>(
            'SELECT * FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] ?? null;
    }

    async isUserAdmin(userId: string): Promise<boolean> {
        const result = await this.db.query(
            `
      SELECT 1
      FROM user_roles ur
      INNER JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = $1 AND r.name = 'admin'
      LIMIT 1
      `,
            [userId]
        );
        return result.rows.length > 0;
    }

    async assignRoleToUser(userId: string, roleName: string): Promise<boolean> {
        await this.db.query(
            'INSERT INTO roles (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
            [roleName]
        );

        const result = await this.db.query<{ user_id: string }>(
            `
      INSERT INTO user_roles (user_id, role_id)
      SELECT $1, r.id
      FROM roles r
      WHERE r.name = $2
      ON CONFLICT DO NOTHING
      RETURNING user_id
      `,
            [userId, roleName]
        );

        return (result.rowCount ?? result.rows.length) > 0;
    }
}
