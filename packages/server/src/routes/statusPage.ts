import { Router, Request, Response, NextFunction } from 'express';
import * as statusPageService from '../services/statusPageService.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { UpdateStatusPageConfigSchema } from '../validation/statusPage.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

// Admin endpoints
router.get('/config', authenticate, asyncHandler(async (req, res) => {
  const result = await statusPageService.getConfig(req.user!.orgId);
  res.json(result);
}));

router.patch('/config', authenticate, validate(UpdateStatusPageConfigSchema), asyncHandler(async (req, res) => {
  const result = await statusPageService.updateConfig(req.user!.orgId, req.body);
  res.json(result);
}));

export default router;
