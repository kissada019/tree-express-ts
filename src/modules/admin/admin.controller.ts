import type { NextFunction, Request, Response } from 'express';
import { BadRequestError, NotFoundError } from '@errors/app.error';
import { adminService } from '@src/modules/admin/admin.service';
import { usersService } from '@src/modules/users/users.service';

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

export const createAdminUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      username,
      email,
      password_hash,
      password,
      first_name,
      last_name,
      phone,
      address,
      subdistrict,
      district,
      province,
      postal_code,
    } = req.body as Record<string, unknown>;

    const rawPassword = typeof password_hash === 'string' ? password_hash : password;
    if (
      typeof username !== 'string' ||
      typeof email !== 'string' ||
      typeof rawPassword !== 'string' ||
      !username.trim() ||
      !email.trim() ||
      !rawPassword.trim()
    ) {
      next(new BadRequestError('username, email and password are required'));
      return;
    }

    const user = await usersService.createUserWithRole(
      {
        username: username.trim(),
        email: email.trim(),
        password_hash: rawPassword,
        first_name: typeof first_name === 'string' ? first_name.trim() || null : null,
        last_name: typeof last_name === 'string' ? last_name.trim() || null : null,
        phone: typeof phone === 'string' ? phone.trim() || null : null,
        address: typeof address === 'string' ? address.trim() || null : null,
        subdistrict: typeof subdistrict === 'string' ? subdistrict.trim() || null : null,
        district: typeof district === 'string' ? district.trim() || null : null,
        province: typeof province === 'string' ? province.trim() || null : null,
        postal_code: typeof postal_code === 'string' ? postal_code.trim() || null : null,
      },
      'admin'
    );

    res.status(201).json({
      ...user,
      role: 'admin',
    });
  } catch (error) {
    next(error);
  }
};

export const assignSuperadminRoleController = async (
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

    const assigned = await adminService.assignSuperadminRole(id);
    res.status(200).json({
      userId: id,
      role: 'superadmin',
      assigned,
    });
  } catch (error) {
    next(error);
  }
};
