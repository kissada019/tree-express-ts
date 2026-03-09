import type { NextFunction, Request, Response } from 'express';
import { BadRequestError } from '@errors/app.error';
import { dashboardService } from '@src/modules/dashboard/dashboard.service';

export const getDashboardSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fromDate = typeof req.query.from === 'string' ? req.query.from : undefined;
    const toDate = typeof req.query.to === 'string' ? req.query.to : undefined;

    const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
    if (fromDate && !isValidDate(fromDate)) {
      next(new BadRequestError('from must be format YYYY-MM-DD'));
      return;
    }
    if (toDate && !isValidDate(toDate)) {
      next(new BadRequestError('to must be format YYYY-MM-DD'));
      return;
    }

    const summary = await dashboardService.getSummary(fromDate, toDate);
    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};

