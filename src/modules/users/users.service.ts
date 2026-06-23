import pool from '@src/configs/db.config';
import {
  CreateUserInput,
  UpdateUserInput,
  UserRecord,
  UserWithRoles,
  UsersRepository,
} from './users.repository';


export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) { }

  async createUser(params: CreateUserInput): Promise<UserRecord> {
    return this.createUserWithRole(params, 'user');
  }

  async createUserWithRole(params: CreateUserInput, roleName: string): Promise<UserRecord> {
    const user = await this.usersRepository.create(params);
    await this.usersRepository.assignRoleToUser(user.id, roleName);
    return user;
  }

  listUsers(): Promise<UserWithRoles[]> {
    return this.usersRepository.findAll();
  }

  getUserById(id: string): Promise<UserRecord | null> {
    return this.usersRepository.findById(id);
  }

  updateUserById(id: string, params: UpdateUserInput): Promise<UserRecord | null> {
    return this.usersRepository.updateById(id, params);
  }

  deleteUserById(id: string): Promise<UserRecord | null> {
    return this.usersRepository.deleteById(id);
  }
}

const usersRepository = new UsersRepository(pool);
export const usersService = new UsersService(usersRepository);
