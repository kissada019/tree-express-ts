import { Router } from 'express';
import type { Request } from 'express';
import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import path from 'path';
import {
  createTreeController,
  deleteTreeByIdController,
  getTreeByIdController,
  listTreesController,
  updateTreeByIdController,
} from '@src/modules/trees/trees.controller';

const router = Router();
const uploadDir = path.join(process.cwd(), 'uploads');
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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

router.post('/', upload.any(), createTreeController);
router.get('/', listTreesController);
router.get('/:id', getTreeByIdController);
router.put('/:id', upload.any(), updateTreeByIdController);
router.delete('/:id', deleteTreeByIdController);

export default router;
