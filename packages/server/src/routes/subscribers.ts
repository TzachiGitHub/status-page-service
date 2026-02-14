import { Router, Request, Response, NextFunction } from 'express';
import * as subscriberService from '../services/subscriberService.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { SubscribeSchema } from '../validation/subscribers.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

// Public endpoints
router.post('/:orgSlug/subscribe', validate(SubscribeSchema), asyncHandler(async (req, res) => {
  // Need to resolve orgSlug to orgId
  const { default: prisma } = await import('../lib/prisma.js');
  const org = await prisma.organization.findUnique({ where: { slug: req.params.orgSlug } });
  if (!org) { res.status(404).json({ error: { code: 'RESOURCE_NOT_FOUND', message: 'Organization not found' } }); return; }
  const result = await subscriberService.subscribe(req.body.email, org.id);
  res.status(201).json(result);
}));

router.get('/confirm/:token', asyncHandler(async (req, res) => {
  const result = await subscriberService.confirm(req.params.token);
  res.json(result);
}));

router.get('/unsubscribe/:token', asyncHandler(async (req, res) => {
  const result = await subscriberService.unsubscribe(req.params.token);
  res.json(result);
}));

// Admin endpoints (auth required)
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await subscriberService.list(req.user!.orgId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
}));

router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const result = await subscriberService.remove(req.params.id, req.user!.orgId);
  res.json(result);
}));

export default router;
