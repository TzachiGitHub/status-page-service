import { Router, Request, Response, NextFunction } from 'express';
import * as componentService from '../services/componentService.js';
import { validate } from '../middleware/validate.js';
import { requireMinRole } from '../middleware/auth.js';
import { CreateComponentSchema, UpdateComponentSchema, ReorderComponentsSchema } from '../validation/components.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

router.get('/', asyncHandler(async (req, res) => {
  const result = await componentService.list(req.user!.orgId);
  res.json(result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await componentService.getById(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/', requireMinRole('EDITOR'), validate(CreateComponentSchema), asyncHandler(async (req, res) => {
  const result = await componentService.create(req.body, req.user!.orgId);
  res.status(201).json(result);
}));

router.patch('/:id', requireMinRole('EDITOR'), validate(UpdateComponentSchema), asyncHandler(async (req, res) => {
  const result = await componentService.update(req.params.id, req.body, req.user!.orgId);
  res.json(result);
}));

router.delete('/:id', requireMinRole('ADMIN'), asyncHandler(async (req, res) => {
  const result = await componentService.remove(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/reorder', requireMinRole('EDITOR'), validate(ReorderComponentsSchema), asyncHandler(async (req, res) => {
  const result = await componentService.reorder(req.body.ids, req.user!.orgId);
  res.json(result);
}));

router.get('/:id/history', asyncHandler(async (req, res) => {
  let days = req.query.days ? Number(req.query.days) : 30;
  if (isNaN(days) || days < 1) days = 1;
  if (days > 365) days = 365;
  const result = await componentService.getStatusHistory(req.params.id, days);
  res.json(result);
}));

export default router;
