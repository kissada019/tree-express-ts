import { Router } from 'express';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import { requireAdmin } from '@src/middlewares/admin.middleware';
import { getDashboardSummaryController } from '@src/modules/dashboard/dashboard.controller';

const router = Router();

router.use(authenticateJwt);
router.use(requireAdmin);

router.get('/summary', getDashboardSummaryController);

export default router;

