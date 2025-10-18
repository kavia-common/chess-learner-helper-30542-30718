import { AnyZodObject, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

// PUBLIC_INTERFACE
export function validateBody(schema: AnyZodObject) {
  /** Validates request body against a zod schema. */
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      const ze = e as ZodError;
      res.status(400).json({ success: false, error: 'Validation failed', details: ze.errors });
    }
  };
}
