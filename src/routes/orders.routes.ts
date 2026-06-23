import { Router } from 'express';
import type { Request } from 'express';
import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import path from 'path';
import { authenticateJwt } from '@src/middlewares/auth.middleware';
import { requireAdmin } from '@src/middlewares/admin.middleware';
import {
  createDirectOrderController,
  getAllOrdersController,
  getOrderItemsByPayloadController,
  getMyOrdersController,
  getOrderByIdController,
  updateOrderStatusController,
  uploadPaymentSlipController,
} from '@src/modules/orders/orders.controller';

const router = Router();
const uploadDir = path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    const safeName = `slip-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image files are allowed'));
  },
});

router.use(authenticateJwt);

router.post('/', createDirectOrderController);
router.get('/admin/all', requireAdmin, getAllOrdersController);
router.get('/items', getOrderItemsByPayloadController);
router.get('/', getMyOrdersController);
router.post('/:id/payment-slip', upload.single('payment_slip'), uploadPaymentSlipController);
router.patch('/:id/status', requireAdmin, updateOrderStatusController);
router.get('/:id', getOrderByIdController);

export default router;
