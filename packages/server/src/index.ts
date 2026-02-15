import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.js';
import monitorRoutes from './routes/monitors.js';
import componentRoutes from './routes/components.js';
import componentGroupRoutes from './routes/componentGroups.js';
import incidentRoutes from './routes/incidents.js';
import subscriberRoutes from './routes/subscribers.js';
import notificationChannelRoutes from './routes/notificationChannels.js';
import apiKeyRoutes from './routes/apiKeys.js';
import statusPageRoutes from './routes/statusPage.js';
import publicRoutes from './routes/public.js';
import sseRoutes from './sse/routes.js';
import { createHeartbeatRouter } from './routes/heartbeat.js';
import { authenticate } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sanitizeBody } from './middleware/sanitize.js';
import prisma from './lib/prisma.js';

// __dirname available natively in CJS

const app = express();
const PORT = parseInt(process.env.PORT || '3030', 10);

const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : [];
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : undefined,
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(sanitizeBody);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/monitors', authenticate, monitorRoutes);
app.use('/api/components', authenticate, componentRoutes);
app.use('/api/component-groups', authenticate, componentGroupRoutes);
app.use('/api/incidents', authenticate, incidentRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/notification-channels', authenticate, notificationChannelRoutes);
app.use('/api/api-keys', authenticate, apiKeyRoutes);
app.use('/api/status-page', statusPageRoutes);
app.use('/api/public', publicRoutes);

// SSE routes
app.use(sseRoutes);

// Heartbeat endpoint (no auth — external services POST to it)
app.use('/api/heartbeat', createHeartbeatRouter(prisma));

// Serve public status page
app.use('/status', express.static(path.join(__dirname, '../public/status-page')));
// SPA fallback for status page
app.get('/status/*', (_req, res) => {
  const indexPath = path.join(__dirname, '../public/status-page/index.html');
  res.sendFile(indexPath, (err) => { if (err) res.status(404).end(); });
});

// Serve dashboard (catch-all for non-API routes)
app.use(express.static(path.join(__dirname, '../public/dashboard')));

// JSON 404 handler for API routes (instead of Express default HTML)
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handling for service errors (NotFoundError etc.)
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({ error: { code: err.code || 'ERROR', message: err.message } });
    return;
  }
  next(err);
});

app.use(errorHandler);

// SPA fallback for dashboard (must be after API routes and error handlers)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/status')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  const indexPath = path.join(__dirname, '../public/dashboard/index.html');
  res.sendFile(indexPath, (err) => { if (err) res.status(404).end(); });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Status Page server running on http://localhost:${PORT}`);
  });
}

export default app;
