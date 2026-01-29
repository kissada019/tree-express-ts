import type { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '@errors/app.error';
import { authService } from '@src/modules/auth/auth.service';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (typeof username !== 'string' || typeof password !== 'string') {
      next(new BadRequestError('username and password are required'));
      return;
    }

    const result = await authService.login(username.trim(), password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
