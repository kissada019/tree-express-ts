import pool from '@src/configs/db.config';
import {
  CreateTreeInput,
  TreeRecord,
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

  getTreeById(id: string): Promise<TreeRecord | null> {
    return this.treesRepository.findById(id);
  }

  updateTreeById(id: string, params: UpdateTreeInput): Promise<TreeRecord | null> {
    return this.treesRepository.updateById(id, params);
  }

  deleteTreeById(id: string): Promise<TreeRecord | null> {
    return this.treesRepository.deleteById(id);
  }
}

const treesRepository = new TreesRepository(pool);
export const treesService = new TreesService(treesRepository);
