import { Router, Request, Response } from 'express';

export function createHeartbeatRouter(prisma: any): Router {
  const router = Router();

  async function handleHeartbeat(req: Request, res: Response) {
    const { token } = req.params;

    try {
      const monitor = await prisma.monitor.findUnique({
        where: { heartbeatToken: token },
      });

      if (!monitor) {
        return res.status(404).json({ error: 'Monitor not found' });
      }

      if (monitor.type !== 'HEARTBEAT') {
        return res.status(400).json({ error: 'Monitor is not a heartbeat type' });
      }

      const now = new Date();

      // Update lastCheckedAt
      await prisma.monitor.update({
        where: { id: monitor.id },
        data: { lastCheckedAt: now, currentStatus: 'UP' },
      });

      // Record an UP check
      await prisma.monitorCheck.create({
        data: {
          monitorId: monitor.id,
          status: 'UP',
          responseTime: 0,
          region: 'heartbeat',
        },
      });

      return res.json({ ok: true, msg: 'Heartbeat recorded' });
    } catch (err: any) {
      console.error('[Heartbeat] Error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  router.post('/:token', handleHeartbeat);
  router.get('/:token', handleHeartbeat);

  return router;
}
