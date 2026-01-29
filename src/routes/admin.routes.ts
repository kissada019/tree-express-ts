import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import { requireAdmin } from '@src/middlewares/admin.middleware';
import {
  assignAdminRoleController,
  listUsersAdminController,
} from '@src/modules/admin/admin.controller';

const router = Router({ mergeParams: true });

router.use(authenticateJwt);
router.use(requireAdmin);

router.get('/users', listUsersAdminController);
router.post('/users/:id/roles/admin', assignAdminRoleController);

export default router;