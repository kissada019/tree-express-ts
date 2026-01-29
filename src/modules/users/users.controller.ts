import type { NextFunction, Request, Response } from 'express';
import { usersService } from '@src/modules/users/users.service';


export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await usersService.createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const listUsersController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await usersService.listUsers();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid user id' });
      return;
    }
    const user = await usersService.getUserById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid user id' });
      return;
    }
    const user = await usersService.updateUserById(id, req.body);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUserByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid user id' });
      return;
    }
    const user = await usersService.deleteUserById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
