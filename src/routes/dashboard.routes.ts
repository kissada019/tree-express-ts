import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import { requireSuperadmin } from '@src/middlewares/admin.middleware';
import { getDashboardSummaryController } from '@src/modules/dashboard/dashboard.controller';

const router = Router();

router.use(authenticateJwt);
router.use(requireSuperadmin);

router.get('/summary', getDashboardSummaryController);

export default router;
