import type { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@errors/app.error';
import { adminService } from '@src/modules/admin/admin.service';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const listUsersAdminController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await adminService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const assignAdminRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string' || !UUID_REGEX.test(id)) {
      next(new BadRequestError('Invalid user id'));
      return;
    }

    const user = await adminService.getUserById(id);
    if (!user) {
      next(new NotFoundError('User not found'));
      return;
    }

    const assigned = await adminService.assignAdminRole(id);
    res.status(200).json({
      userId: id,
      role: 'admin',
      assigned,
    });
  } catch (error) {
    next(error);
  }
};
