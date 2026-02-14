import { Router, Request, Response, NextFunction } from 'express';
import * as statusPageService from '../services/statusPageService.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

router.get('/:slug/status', asyncHandler(async (req, res) => {
  const result = await statusPageService.getPublicStatus(req.params.slug);
  res.json(result);
}));

router.get('/:slug/incidents', asyncHandler(async (req, res) => {
  const result = await statusPageService.getPublicIncidents(req.params.slug);
  res.json(result);
}));

router.get('/:slug/uptime', asyncHandler(async (req, res) => {
  const days = req.query.days ? Number(req.query.days) : 90;
  const result = await statusPageService.getPublicUptime(req.params.slug, days);
  res.json(result);
}));

router.get('/:slug/metrics', asyncHandler(async (req, res) => {
  const result = await statusPageService.getPublicMetrics(req.params.slug);
  res.json(result);
}));

export default router;
