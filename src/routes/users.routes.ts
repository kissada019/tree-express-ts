import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import {
  createUserController,
  listUsersController,
  getUserByIdController,
  updateUserByIdController,
  deleteUserByIdController,
} from '@src/modules/users/users.controller';


const router = Router();

router.post('/', createUserController);
router.get('/', authenticateJwt, listUsersController);
router.get('/:id', getUserByIdController);
router.put('/:id', updateUserByIdController);
router.delete('/:id', deleteUserByIdController);

export default router;
