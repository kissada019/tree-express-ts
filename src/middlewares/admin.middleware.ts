import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '@errors/app.error';
import { adminService } from '@src/modules/admin/admin.service';

export const requireAdmin = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            next(new UnauthorizedError('Missing authenticated user'));
            return;
        }

        const isAdmin = await adminService.isUserAdmin(userId);
        if (!isAdmin) {
            next(new ForbiddenError('Admin access required'));
            return;
        }

        next();
    } catch (error) {
        next(error);
    }
};
