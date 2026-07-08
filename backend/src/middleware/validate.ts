import { Request, Response, NextFunction } from 'express';
import { ValidationError, validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err: ValidationError) => ({
        field: 'param' in err ? err.param : 'unknown',
        message: err.msg,
      })),
    });
    return;
  }

  next();
};
