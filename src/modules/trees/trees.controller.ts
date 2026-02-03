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
    const uploadedFile = req.file
      ?? (Array.isArray(req.files) ? req.files[0] : undefined);
    if (uploadedFile) {
      payload.image_url = `/uploads/${uploadedFile.filename}`;
    }
    const tree = await treesService.createTree(payload);
    res.status(201).json(tree);
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
