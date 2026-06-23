import type { NextFunction, Request, Response } from 'express';
import { treesService } from '@src/modules/trees/trees.service';
import type { CreateTreeInput, UpdateTreeInput } from '@src/modules/trees/trees.repository';

const toNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(num) ? undefined : num;
};

const normalizeTreePayload = (body: Record<string, unknown>) => {
  return {
    name: body.name,
    species: body.species,
    buy_price: body.buy_price ?? body.buyPrice,
    sell_price: body.sell_price ?? body.sellPrice,
    quantity: body.quantity ?? body.qty,
    image_url: body.image_url ?? body.imageUrl,
    status: body.status,
  };
};

export const createTreeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = normalizeTreePayload(req.body as Record<string, unknown>) as CreateTreeInput;
    const buyPrice = toNumber(payload.buy_price);
    if (buyPrice !== undefined) {
      payload.buy_price = buyPrice;
    }
    const sellPrice = toNumber(payload.sell_price);
    if (sellPrice !== undefined) {
      payload.sell_price = sellPrice;
    }
    const qty = toNumber(payload.quantity);
    if (qty !== undefined) {
      payload.quantity = qty;
    }
    
    // Get all uploaded files
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    const firstFile = uploadedFiles[0] ?? req.file;
    
    if (firstFile) {
      payload.image_url = `/uploads/${firstFile.filename}`;
    }
    
    const tree = await treesService.createTree(payload);
    
    // Save all images to tree_images table
    if (uploadedFiles.length > 0) {
      const imageUrls = uploadedFiles.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
      const images = await treesService.addTreeImages(tree.id, imageUrls);
      res.status(201).json({ ...tree, images });
    } else {
      res.status(201).json(tree);
    }
  } catch (error) {
    next(error);
  }
};

export const listTreesController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const trees = await treesService.listTrees();
    res.status(200).json(trees);
  } catch (error) {
    next(error);
  }
};

export const getTreeByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid tree id' });
      return;
    }
    const tree = await treesService.getTreeById(id);
    if (!tree) {
      res.status(404).json({ message: 'Tree not found' });
      return;
    }
    res.status(200).json(tree);
  } catch (error) {
    next(error);
  }
};

export const updateTreeByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid tree id' });
      return;
    }
    const payload = normalizeTreePayload(req.body as Record<string, unknown>) as UpdateTreeInput;
    const buyPrice = toNumber(payload.buy_price);
    if (buyPrice !== undefined) {
      payload.buy_price = buyPrice;
    }
    const sellPrice = toNumber(payload.sell_price);
    if (sellPrice !== undefined) {
      payload.sell_price = sellPrice;
    }
    const qty = toNumber(payload.quantity);
    if (qty !== undefined) {
      payload.quantity = qty;
    }
    const uploadedFile = req.file
      ?? (Array.isArray(req.files) ? req.files[0] : undefined);
    if (uploadedFile) {
      payload.image_url = `/uploads/${uploadedFile.filename}`;
    }
    const tree = await treesService.updateTreeById(id, payload);
    if (!tree) {
      res.status(404).json({ message: 'Tree not found' });
      return;
    }
    res.status(200).json(tree);
  } catch (error) {
    next(error);
  }
};

export const deleteTreeByIdController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid tree id' });
      return;
    }
    const tree = await treesService.deleteTreeById(id);
    if (!tree) {
      res.status(404).json({ message: 'Tree not found' });
      return;
    }
    res.status(200).json(tree);
  } catch (error) {
    next(error);
  }
};

// Tree Images Controllers
export const addTreeImagesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid tree id' });
      return;
    }
    
    // Check if tree exists
    const tree = await treesService.getTreeById(id);
    if (!tree) {
      res.status(404).json({ message: 'Tree not found' });
      return;
    }
    
    const uploadedFiles = Array.isArray(req.files) ? req.files : [];
    if (uploadedFiles.length === 0) {
      res.status(400).json({ message: 'No files uploaded' });
      return;
    }
    
    const imageUrls = uploadedFiles.map((file: Express.Multer.File) => `/uploads/${file.filename}`);
    const images = await treesService.addTreeImages(id, imageUrls);
    res.status(201).json(images);
  } catch (error) {
    next(error);
  }
};

export const getTreeImagesController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (typeof id !== 'string') {
      res.status(400).json({ message: 'Invalid tree id' });
      return;
    }
    
    const images = await treesService.getTreeImages(id);
    res.status(200).json(images);
  } catch (error) {
    next(error);
  }
};

export const deleteTreeImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: imageId } = req.params;
    if (typeof imageId !== 'string') {
      res.status(400).json({ message: 'Invalid image id' });
      return;
    }
    
    const image = await treesService.deleteTreeImageById(imageId);
    if (!image) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }
    
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const updateImagePrimaryController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { treeId, imageId } = req.params;
    if (typeof treeId !== 'string' || typeof imageId !== 'string') {
      res.status(400).json({ message: 'Invalid tree id or image id' });
      return;
    }
    
    await treesService.updateImagePrimary(imageId, treeId);
    res.status(200).json({ message: 'Primary image updated successfully' });
  } catch (error) {
    next(error);
  }
};
