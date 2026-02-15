import { Router, Request, Response, NextFunction } from 'express';
import * as monitorService from '../services/monitorService.js';
import { validate } from '../middleware/validate.js';
import { requireMinRole } from '../middleware/auth.js';
import { validatePagination } from '../middleware/pagination.js';
import { CreateMonitorSchema, UpdateMonitorSchema } from '../validation/monitors.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const { page, limit, status, type } = req.query;
  const result = await monitorService.list(req.user!.orgId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as string,
    type: type as string,
  });
  res.json(result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await monitorService.getById(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/', requireMinRole('EDITOR'), validate(CreateMonitorSchema), asyncHandler(async (req, res) => {
  const result = await monitorService.create(req.body, req.user!.orgId);
  res.status(201).json(result);
}));

router.patch('/:id', requireMinRole('EDITOR'), validate(UpdateMonitorSchema), asyncHandler(async (req, res) => {
  const result = await monitorService.update(req.params.id, req.body, req.user!.orgId);
  res.json(result);
}));

router.delete('/:id', requireMinRole('ADMIN'), asyncHandler(async (req, res) => {
  const result = await monitorService.remove(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/:id/pause', requireMinRole('EDITOR'), asyncHandler(async (req, res) => {
  const result = await monitorService.pause(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/:id/resume', requireMinRole('EDITOR'), asyncHandler(async (req, res) => {
  const result = await monitorService.resume(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.get('/:id/checks', asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await monitorService.getChecks(req.params.id, req.user!.orgId, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
  res.json(result);
}));

router.get('/:id/uptime', asyncHandler(async (req, res) => {
  const result = await monitorService.getUptimeStats(req.params.id);
  res.json(result);
}));

router.get('/:id/response-times', asyncHandler(async (req, res) => {
  const result = await monitorService.getResponseTimes(req.params.id, req.query.range as string);
  res.json(result);
}));

export default router;
