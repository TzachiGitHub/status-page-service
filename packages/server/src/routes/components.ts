import { Router, Request, Response, NextFunction } from 'express';
import * as componentService from '../services/componentService.js';
import { validate } from '../middleware/validate.js';
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

router.post('/', validate(CreateComponentSchema), asyncHandler(async (req, res) => {
  const result = await componentService.create(req.body, req.user!.orgId);
  res.status(201).json(result);
}));

router.patch('/:id', validate(UpdateComponentSchema), asyncHandler(async (req, res) => {
  const result = await componentService.update(req.params.id, req.body, req.user!.orgId);
  res.json(result);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await componentService.remove(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/reorder', validate(ReorderComponentsSchema), asyncHandler(async (req, res) => {
  const result = await componentService.reorder(req.body.ids, req.user!.orgId);
  res.json(result);
}));

router.get('/:id/history', asyncHandler(async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 30;
  const result = await componentService.getStatusHistory(req.params.id, days);
  res.json(result);
}));

export default router;
