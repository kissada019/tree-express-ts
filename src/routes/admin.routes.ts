import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import { requireSuperadmin } from '@src/middlewares/admin.middleware';
import {
  assignSuperadminRoleController,
  createAdminUserController,
  listUsersAdminController,
} from '@src/modules/admin/admin.controller';

const router = Router({ mergeParams: true });

router.use(authenticateJwt);
router.use(requireSuperadmin);

router.get('/users', listUsersAdminController);
router.post('/users/admin', createAdminUserController);
router.post('/users/:id/roles/superadmin', assignSuperadminRoleController);

export default router;
