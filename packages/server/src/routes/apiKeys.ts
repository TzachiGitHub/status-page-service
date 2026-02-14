import { Router, Request, Response, NextFunction } from 'express';
import * as apiKeyService from '../services/apiKeyService.js';
import { validate } from '../middleware/validate.js';
import { CreateApiKeySchema } from '../validation/apiKeys.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
}

// Only OWNER and ADMIN can manage API keys
function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || !['OWNER', 'ADMIN'].includes(req.user.role)) {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only OWNER and ADMIN can manage API keys' } });
    return;
  }
  next();
}

router.use(requireAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const result = await apiKeyService.list(req.user!.orgId);
  res.json(result);
}));

router.post('/', validate(CreateApiKeySchema), asyncHandler(async (req, res) => {
  const result = await apiKeyService.create(req.body, req.user!.orgId);
  res.status(201).json(result);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await apiKeyService.revoke(req.params.id, req.user!.orgId);
  res.json(result);
}));

export default router;
