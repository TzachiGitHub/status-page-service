import { Router, type Request, type Response } from 'express';
import { authenticate } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';
import { sseManager } from './manager.js';

const router = Router();

function setupSSE(res: Response): NodeJS.Timeout {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(':ok\n\n');

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    try { res.write(':ping\n\n'); } catch { /* connection closed */ }
  }, 30_000);

  return heartbeat;
}

// Dashboard SSE — requires auth
router.get('/api/sse/dashboard', authenticate, (req: Request, res: Response) => {
  const orgId = req.user!.orgId;
  const heartbeat = setupSSE(res);

  sseManager.addConnection(orgId, 'dashboard', res);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseManager.removeConnection(orgId, 'dashboard', res);
  });
});

// Public SSE — no auth, by org slug
router.get('/api/public/:slug/sse', async (req: Request, res: Response) => {
  const org = await prisma.organization.findUnique({ where: { slug: req.params.slug } });
  if (!org) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const heartbeat = setupSSE(res);
  sseManager.addConnection(org.id, 'public', res);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseManager.removeConnection(org.id, 'public', res);
  });
});

export default router;
