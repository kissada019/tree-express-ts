import bcrypt from 'bcryptjs';
import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import pool from '@src/configs/db.config';
import { InternalServerError, UnauthorizedError } from '@errors/app.error';
import { AuthRepository } from '@src/modules/auth/auth.repository';

const isBcryptHash = (value: string): boolean => value.startsWith('$2a$')
  || value.startsWith('$2b$')
  || value.startsWith('$2y$');

export interface AuthTokenPayload {
  sub: string;
  email?: string;
  username?: string;
}

const DEFAULT_JWT_SECRET = 'dev-secret';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(username: string, password: string) {
    const user = await this.authRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const storedHash = user.password_hash;
    const isValid = isBcryptHash(storedHash)
      ? await bcrypt.compare(password, storedHash)
      : storedHash === password;

    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const secret = (process.env.JWT_SECRET || DEFAULT_JWT_SECRET) as Secret;

    const expiresInRaw = process.env.JWT_EXPIRES_IN ?? '1h';
    const expiresIn = expiresInRaw as SignOptions['expiresIn'];
    const payload: AuthTokenPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const signOptions: SignOptions = {};
    if (expiresIn !== undefined) {
      signOptions.expiresIn = expiresIn;
    }
    const token = jwt.sign(payload, secret, signOptions);

    const roles = await this.authRepository.getRolesByUserId(user.id);
    const role = roles[0] ?? 'user';

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role,
        roles,
      },
      expiresIn,
    };
  }
}

const authRepository = new AuthRepository(pool);
export const authService = new AuthService(authRepository);
