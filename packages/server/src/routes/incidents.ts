import { Router, Request, Response, NextFunction } from 'express';
import * as incidentService from '../services/incidentService.js';
import { validate } from '../middleware/validate.js';
import { requireMinRole } from '../middleware/auth.js';
import { validatePagination } from '../middleware/pagination.js';
import { CreateIncidentSchema, UpdateIncidentSchema, AddIncidentUpdateSchema } from '../validation/incidents.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await incidentService.list(req.user!.orgId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
  });
  res.json(result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await incidentService.getById(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/', requireMinRole('EDITOR'), validate(CreateIncidentSchema), asyncHandler(async (req, res) => {
  const result = await incidentService.create(req.body, req.user!.orgId);
  res.status(201).json(result);
}));

router.patch('/:id', validate(UpdateIncidentSchema), asyncHandler(async (req, res) => {
  const result = await incidentService.update(req.params.id, req.body, req.user!.orgId);
  res.json(result);
}));

router.delete('/:id', requireMinRole('ADMIN'), asyncHandler(async (req, res) => {
  const result = await incidentService.remove(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/:id/updates', validate(AddIncidentUpdateSchema), asyncHandler(async (req, res) => {
  const result = await incidentService.addUpdate(req.params.id, req.body, req.user!.orgId);
  res.status(201).json(result);
}));

export default router;
