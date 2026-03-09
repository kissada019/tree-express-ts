import pool from '@src/configs/db.config';
import { DashboardRepository, type DashboardSummary } from '@src/modules/dashboard/dashboard.repository';

export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  getSummary(fromDate?: string, toDate?: string): Promise<DashboardSummary> {
    return this.dashboardRepository.getSummary(fromDate, toDate);
  }
}

const dashboardRepository = new DashboardRepository(pool);
export const dashboardService = new DashboardService(dashboardRepository);

