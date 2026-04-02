import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(source === 'body' ? req.body : req.query);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: (result.error as ZodError).issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }

    if (source === 'body') req.body = result.data;
    else req.query = result.data as Record<string, string>;

    next();
  };
}
