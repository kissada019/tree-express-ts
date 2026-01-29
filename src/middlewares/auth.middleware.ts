import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { BadRequestError, UnauthorizedError } from '@errors/app.error';
import type { AuthTokenPayload } from '@src/modules/auth/auth.service';
import type { AuthUser } from '@src/types/express';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const authenticateJwt = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.header('authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    next(new UnauthorizedError('Missing bearer token'));
    return;
  }

  const token = authHeader.slice('bearer '.length).trim();
  const secret = process.env.JWT_SECRET || 'dev-secret';

  try {
    const payload = jwt.verify(token, secret) as AuthTokenPayload;
    if (!payload?.sub || !UUID_REGEX.test(payload.sub)) {
      next(new BadRequestError('Invalid token subject'));
      return;
    }

    const user: AuthUser = { id: payload.sub };
    if (payload.email) {
      user.email = payload.email;
    }
    if (payload.username) {
      user.username = payload.username;
    }
    req.user = user;
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
};
