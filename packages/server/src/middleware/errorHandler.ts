import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);

  // Handle Prisma known request errors (FK violations, unique constraints, etc.)
  if (err?.constructor?.name === 'PrismaClientKnownRequestError' || err?.code?.startsWith?.('P')) {
    if (err.code === 'P2003') {
      res.status(422).json({ error: 'Referenced resource not found' });
      return;
    }
    if (err.code === 'P2002') {
      const target = err.meta?.target;
      res.status(409).json({ error: `Unique constraint violation${target ? ` on ${target}` : ''}` });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }
  }

  // Handle Prisma validation errors (invalid enum values, etc.)
  if (err?.constructor?.name === 'PrismaClientValidationError') {
    res.status(400).json({ error: 'Invalid request data' });
    return;
  }

  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { message: err.message } : {}),
  });
}
