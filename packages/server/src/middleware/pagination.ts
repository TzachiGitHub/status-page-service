import { Request, Response, NextFunction } from 'express';

export function validatePagination(req: Request, res: Response, next: NextFunction): void {
  const { page, limit } = req.query;

  if (page !== undefined) {
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1) {
      res.status(400).json({ error: 'page must be a positive integer' });
      return;
    }
  }

  if (limit !== undefined) {
    const l = Number(limit);
    if (!Number.isInteger(l) || l < 1 || l > 100) {
      res.status(400).json({ error: 'limit must be an integer between 1 and 100' });
      return;
    }
  }

  next();
}
