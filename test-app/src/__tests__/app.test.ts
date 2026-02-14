import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Test App Endpoints', () => {
  it('GET /health returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.uptime).toBeDefined();
  });

  it('GET /slow returns 200', async () => {
    const res = await request(app).get('/slow');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.delay).toBeGreaterThanOrEqual(2000);
  }, 10000);

  it('GET /flaky returns either 200 or 503', async () => {
    const res = await request(app).get('/flaky');
    expect([200, 503]).toContain(res.status);
  });

  it('GET /crash returns 500', async () => {
    const res = await request(app).get('/crash');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('GET /status/404 returns 404', async () => {
    const res = await request(app).get('/status/404');
    expect(res.status).toBe(404);
    expect(res.body.status).toBe(404);
  });

  it('GET /keyword contains "All Systems Operational"', async () => {
    const res = await request(app).get('/keyword');
    expect(res.status).toBe(200);
    expect(res.text).toContain('All Systems Operational');
  });

  it('POST /heartbeat records heartbeat', async () => {
    const res = await request(app).post('/heartbeat');
    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('GET /heartbeats returns recent heartbeats', async () => {
    // First post one
    await request(app).post('/heartbeat');
    const res = await request(app).get('/heartbeats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.heartbeats)).toBe(true);
    expect(res.body.heartbeats.length).toBeGreaterThanOrEqual(1);
  });
});
