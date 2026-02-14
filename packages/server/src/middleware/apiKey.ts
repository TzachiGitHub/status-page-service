import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';

declare global {
  namespace Express {
    interface Request {
      apiOrg?: { orgId: string };
    }
  }
}

export async function authenticateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  const key = req.headers['x-api-key'] as string;
  if (!key) {
    res.status(401).json({ error: 'Missing API key' });
    return;
  }

  try {
    const apiKey = await prisma.apiKey.findUnique({ where: { key } });
    if (!apiKey) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      res.status(401).json({ error: 'API key expired' });
      return;
    }

    await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
    req.apiOrg = { orgId: apiKey.orgId };
    next();
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
}
