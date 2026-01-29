import pool from '@src/configs/db.config';
import { AdminRepository } from '@src/modules/admin/admin.repository';
import { UserRecord } from '@src/modules/users/users.repository';

export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}

  listUsers(): Promise<UserRecord[]> {
    return this.adminRepository.listUsers();
  }

  getUserById(id: string): Promise<UserRecord | null> {
    return this.adminRepository.findUserById(id);
  }

  isUserAdmin(userId: string): Promise<boolean> {
    return this.adminRepository.isUserAdmin(userId);
  }

  assignAdminRole(userId: string): Promise<boolean> {
    return this.adminRepository.assignRoleToUser(userId, 'admin');
  }
}

const adminRepository = new AdminRepository(pool);
export const adminService = new AdminService(adminRepository);
