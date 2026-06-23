import pool from '@src/configs/db.config';
import {
  CreateTreeInput,
  TreeRecord,
  TreeRecordWithImages,
  TreeImage,
  TreesRepository,
  UpdateTreeInput,
} from './trees.repository';

export class TreesService {
  constructor(private readonly treesRepository: TreesRepository) {}

  createTree(params: CreateTreeInput): Promise<TreeRecord> {
    return this.treesRepository.create(params);
  }

  listTrees(): Promise<TreeRecord[]> {
    return this.treesRepository.findAll();
  }

  async getTreeById(id: string): Promise<TreeRecordWithImages | null> {
    return this.treesRepository.findByIdWithImages(id);
  }

  updateTreeById(id: string, params: UpdateTreeInput): Promise<TreeRecord | null> {
    return this.treesRepository.updateById(id, params);
  }

  deleteTreeById(id: string): Promise<TreeRecord | null> {
    return this.treesRepository.deleteById(id);
  }

  // Images methods
  addTreeImages(treeId: string, imageUrls: string[]): Promise<TreeImage[]> {
    return this.treesRepository.addTreeImages(treeId, imageUrls);
  }

  getTreeImages(treeId: string): Promise<TreeImage[]> {
    return this.treesRepository.getTreeImages(treeId);
  }

  deleteTreeImages(treeId: string): Promise<number> {
    return this.treesRepository.deleteTreeImages(treeId);
  }

  deleteTreeImageById(imageId: string): Promise<TreeImage | null> {
    return this.treesRepository.deleteTreeImageById(imageId);
  }

  updateImagePrimary(imageId: string, treeId: string): Promise<void> {
    return this.treesRepository.updateImagePrimary(imageId, treeId);
  }
}

const treesRepository = new TreesRepository(pool);
export const treesService = new TreesService(treesRepository);
