import { Router, Request, Response, NextFunction } from 'express';
import * as channelService from '../services/notificationChannelService.js';
import { validate } from '../middleware/validate.js';
import { CreateNotificationChannelSchema, UpdateNotificationChannelSchema } from '../validation/notificationChannels.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

router.get('/', asyncHandler(async (req, res) => {
  const result = await channelService.list(req.user!.orgId);
  res.json(result);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const result = await channelService.getById(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/', validate(CreateNotificationChannelSchema), asyncHandler(async (req, res) => {
  const result = await channelService.create(req.body, req.user!.orgId);
  res.status(201).json(result);
}));

router.patch('/:id', validate(UpdateNotificationChannelSchema), asyncHandler(async (req, res) => {
  const result = await channelService.update(req.params.id, req.body, req.user!.orgId);
  res.json(result);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await channelService.remove(req.params.id, req.user!.orgId);
  res.json(result);
}));

router.post('/:id/test', asyncHandler(async (req, res) => {
  const result = await channelService.test(req.params.id, req.user!.orgId);
  res.json(result);
}));

export default router;
