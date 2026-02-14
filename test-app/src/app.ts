import express from 'express';

const app = express();
app.use(express.json());

// Always healthy
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Slow response (2-5 second random delay)
app.get('/slow', async (_req, res) => {
  const delay = 2000 + Math.random() * 3000;
  await new Promise(r => setTimeout(r, delay));
  res.json({ status: 'ok', delay: Math.round(delay), message: 'Slow but working' });
});

// Randomly fails 30% of the time
app.get('/flaky', (_req, res) => {
  if (Math.random() < 0.3) {
    res.status(503).json({ error: 'Service temporarily unavailable', timestamp: new Date().toISOString() });
  } else {
    res.json({ status: 'ok', message: 'Got lucky this time' });
  }
});

// Always fails
app.get('/crash', (_req, res) => {
  res.status(500).json({ error: 'Internal server error', message: 'This endpoint always fails' });
});

// Returns custom status code
app.get('/status/:code', (req, res) => {
  const code = parseInt(req.params.code) || 200;
  res.status(code).json({ status: code, message: `Returned status ${code}` });
});

// Keyword check endpoint
app.get('/keyword', (_req, res) => {
  res.send('<html><body><h1>System Status: All Systems Operational</h1></body></html>');
});

// Heavy computation
app.get('/compute', (_req, res) => {
  const start = Date.now();
  let sum = 0;
  for (let i = 0; i < 1e7; i++) sum += Math.sqrt(i);
  res.json({ status: 'ok', computeTime: Date.now() - start, result: sum });
});

// Heartbeat receiver
const heartbeats: { timestamp: string }[] = [];
app.post('/heartbeat', (_req, res) => {
  heartbeats.push({ timestamp: new Date().toISOString() });
  res.json({ received: true, total: heartbeats.length });
});

app.get('/heartbeats', (_req, res) => {
  res.json({ heartbeats: heartbeats.slice(-10) });
});

export { app };
