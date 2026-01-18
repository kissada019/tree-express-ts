import { Request, Response, NextFunction } from 'express';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';
import { ValidationError as E } from '@errors/app.error';

export const validateDto = (dtoClass: ClassConstructor<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Transform plain object (req.body, req.query, req.params) into class instance
      const dtoInstance = plainToInstance(dtoClass, {
        ...req.body,
        ...req.query,
        ...req.params,
      });

      // Perform validation – throws on failure
      await validateOrReject(dtoInstance, {
        whitelist: true,        // Strip unknown properties
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
      });

      next();
    } catch (errors) {
      const validationErrors = (errors as ValidationError[]).reduce((acc, err) => {
        if (err.constraints) {
          acc.push(...Object.values(err.constraints));
        }
        if (err.children && err.children.length > 0) {
          err.children.forEach((child) => {
            if (child.constraints) {
              acc.push(...Object.values(child.constraints));
            }
          });
        }
        return acc;
      }, [] as string[]);

      const error = new E(
        'Validation failed',
        validationErrors.length > 0 ? validationErrors : ['Invalid request data']
      );

      console.error('DTO validation failed', error);
      next(error);
    }
  };
};
