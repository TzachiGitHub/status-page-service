import { Router, Request, Response, NextFunction } from 'express';
import * as groupService from '../services/componentGroupService.js';
import { validate } from '../middleware/validate.js';
import { CreateComponentGroupSchema, UpdateComponentGroupSchema } from '../validation/components.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

router.get('/', asyncHandler(async (req, res) => {
  const result = await groupService.list(req.user!.orgId);
  res.json(result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await groupService.getById(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/', validate(CreateComponentGroupSchema), asyncHandler(async (req, res) => {
  const result = await groupService.create(req.body, req.user!.orgId);
  res.status(201).json(result);
}));

router.patch('/:id', validate(UpdateComponentGroupSchema), asyncHandler(async (req, res) => {
  const result = await groupService.update(req.params.id, req.body, req.user!.orgId);
  res.json(result);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await groupService.remove(req.params.id, req.user!.orgId);
  res.json(result);
}));

export default router;
