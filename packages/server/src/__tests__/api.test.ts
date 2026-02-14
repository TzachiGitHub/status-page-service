import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Mock Prisma before importing app
vi.mock('../lib/prisma.js', () => {
  const mockPrisma: any = {
    monitor: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    monitorCheck: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    component: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    componentGroup: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    incident: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    incidentUpdate: {
      create: vi.fn(),
    },
    incidentComponent: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    subscriber: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    notificationChannel: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    apiKey: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      delete: vi.fn(),
    },
    statusPageConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn(),
    },
    organization: {
      findUnique: vi.fn().mockResolvedValue(null),
    },
    $transaction: vi.fn(async (fns: any[]) => {
      const results = [];
      for (const fn of fns) results.push(await fn);
      return results;
    }),
  };
  return { default: mockPrisma };
});

import app from '../index.js';
import prisma from '../lib/prisma.js';

const TEST_ORG_ID = 'org-123';
const TEST_USER_ID = 'user-123';
const SECRET = process.env.JWT_SECRET || 'secret';

function makeToken(role = 'ADMIN') {
  return jwt.sign({ userId: TEST_USER_ID, orgId: TEST_ORG_ID, role }, SECRET);
}

const authHeader = { Authorization: `Bearer ${makeToken()}` };
const ownerHeader = { Authorization: `Bearer ${makeToken('OWNER')}` };

describe('Monitor CRUD', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should create a monitor', async () => {
    const monitor = { id: 'm1', name: 'Test', type: 'HTTP', url: 'https://example.com', orgId: TEST_ORG_ID };
    (prisma.monitor.create as any).mockResolvedValue(monitor);
    const res = await request(app).post('/api/monitors').set(authHeader)
      .send({ name: 'Test', type: 'HTTP', url: 'https://example.com' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Test');
  });

  it('should list monitors', async () => {
    (prisma.monitor.findMany as any).mockResolvedValue([]);
    (prisma.monitor.count as any).mockResolvedValue(0);
    const res = await request(app).get('/api/monitors').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
  });

  it('should get a monitor by id', async () => {
    const monitor = { id: 'm1', name: 'Test', orgId: TEST_ORG_ID };
    (prisma.monitor.findFirst as any).mockResolvedValue(monitor);
    const res = await request(app).get('/api/monitors/m1').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('m1');
  });

  it('should update a monitor', async () => {
    const monitor = { id: 'm1', name: 'Updated', orgId: TEST_ORG_ID };
    (prisma.monitor.findFirst as any).mockResolvedValue(monitor);
    (prisma.monitor.update as any).mockResolvedValue({ ...monitor, name: 'Updated' });
    const res = await request(app).patch('/api/monitors/m1').set(authHeader).send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });

  it('should delete a monitor', async () => {
    (prisma.monitor.findFirst as any).mockResolvedValue({ id: 'm1', orgId: TEST_ORG_ID });
    (prisma.monitor.delete as any).mockResolvedValue({});
    const res = await request(app).delete('/api/monitors/m1').set(authHeader);
    expect(res.status).toBe(200);
  });

  it('should pause a monitor', async () => {
    (prisma.monitor.findFirst as any).mockResolvedValue({ id: 'm1', orgId: TEST_ORG_ID });
    (prisma.monitor.update as any).mockResolvedValue({ id: 'm1', enabled: false });
    const res = await request(app).post('/api/monitors/m1/pause').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.data.enabled).toBe(false);
  });
});

describe('Component CRUD', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should create a component', async () => {
    const comp = { id: 'c1', name: 'API', orgId: TEST_ORG_ID };
    (prisma.component.create as any).mockResolvedValue(comp);
    const res = await request(app).post('/api/components').set(authHeader).send({ name: 'API' });
    expect(res.status).toBe(201);
  });

  it('should list components', async () => {
    (prisma.component.findMany as any).mockResolvedValue([]);
    const res = await request(app).get('/api/components').set(authHeader);
    expect(res.status).toBe(200);
  });

  it('should update component status', async () => {
    (prisma.component.findFirst as any).mockResolvedValue({ id: 'c1', orgId: TEST_ORG_ID });
    (prisma.component.update as any).mockResolvedValue({ id: 'c1', status: 'DEGRADED_PERFORMANCE' });
    const res = await request(app).patch('/api/components/c1').set(authHeader)
      .send({ status: 'DEGRADED_PERFORMANCE' });
    expect(res.status).toBe(200);
  });

  it('should delete a component', async () => {
    (prisma.component.findFirst as any).mockResolvedValue({ id: 'c1', orgId: TEST_ORG_ID });
    (prisma.component.delete as any).mockResolvedValue({});
    const res = await request(app).delete('/api/components/c1').set(authHeader);
    expect(res.status).toBe(200);
  });

  it('should reorder components', async () => {
    (prisma.component.updateMany as any).mockResolvedValue({ count: 1 });
    const res = await request(app).post('/api/components/reorder').set(authHeader)
      .send({ ids: ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'] });
    expect(res.status).toBe(200);
  });
});

describe('Incident lifecycle', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should create an incident', async () => {
    const incident = { id: 'i1', title: 'Outage', orgId: TEST_ORG_ID, updates: [], components: [] };
    (prisma.incident.create as any).mockResolvedValue(incident);
    const res = await request(app).post('/api/incidents').set(authHeader)
      .send({ title: 'Outage', message: 'Investigating the issue' });
    expect(res.status).toBe(201);
  });

  it('should add an incident update', async () => {
    (prisma.incident.findFirst as any).mockResolvedValue({ id: 'i1', orgId: TEST_ORG_ID });
    (prisma.incidentUpdate.create as any).mockResolvedValue({ id: 'u1', status: 'IDENTIFIED', message: 'Found it' });
    (prisma.incident.update as any).mockResolvedValue({});
    (prisma.$transaction as any).mockResolvedValue([
      { id: 'u1', status: 'IDENTIFIED', message: 'Found it' },
      {},
    ]);
    const res = await request(app).post('/api/incidents/i1/updates').set(authHeader)
      .send({ status: 'IDENTIFIED', message: 'Found it' });
    expect(res.status).toBe(201);
  });

  it('should resolve an incident', async () => {
    (prisma.incident.findFirst as any).mockResolvedValue({ id: 'i1', orgId: TEST_ORG_ID });
    (prisma.incident.update as any).mockResolvedValue({ id: 'i1', status: 'RESOLVED', resolvedAt: new Date() });
    const res = await request(app).patch('/api/incidents/i1').set(authHeader)
      .send({ status: 'RESOLVED' });
    expect(res.status).toBe(200);
  });

  it('should list incidents', async () => {
    (prisma.incident.findMany as any).mockResolvedValue([]);
    (prisma.incident.count as any).mockResolvedValue(0);
    const res = await request(app).get('/api/incidents').set(authHeader);
    expect(res.status).toBe(200);
    expect(res.body.meta).toBeDefined();
  });
});

describe('Public API', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should get public status by slug', async () => {
    const org = { id: TEST_ORG_ID, name: 'Test Org', slug: 'test-org' };
    (prisma.organization.findUnique as any).mockResolvedValue(org);
    (prisma.statusPageConfig.findUnique as any).mockResolvedValue(null);
    (prisma.component.findMany as any).mockResolvedValue([]);
    (prisma.componentGroup.findMany as any).mockResolvedValue([]);
    const res = await request(app).get('/api/public/test-org/status');
    expect(res.status).toBe(200);
    expect(res.body.data.overallStatus).toBe('operational');
  });

  it('should get public incidents by slug', async () => {
    const org = { id: TEST_ORG_ID, name: 'Test Org', slug: 'test-org' };
    (prisma.organization.findUnique as any).mockResolvedValue(org);
    (prisma.incident.findMany as any).mockResolvedValue([]);
    const res = await request(app).get('/api/public/test-org/incidents');
    expect(res.status).toBe(200);
  });

  it('should get public uptime by slug', async () => {
    const org = { id: TEST_ORG_ID, name: 'Test Org', slug: 'test-org' };
    (prisma.organization.findUnique as any).mockResolvedValue(org);
    (prisma.component.findMany as any).mockResolvedValue([]);
    const res = await request(app).get('/api/public/test-org/uptime');
    expect(res.status).toBe(200);
  });
});

describe('Validation', () => {
  it('should reject missing required fields', async () => {
    const res = await request(app).post('/api/monitors').set(authHeader).send({});
    expect(res.status).toBe(400);
  });

  it('should reject bad types', async () => {
    const res = await request(app).post('/api/monitors').set(authHeader)
      .send({ name: 'Test', type: 'INVALID_TYPE' });
    expect(res.status).toBe(400);
  });
});

describe('Auth', () => {
  it('should reject unauthenticated requests', async () => {
    const res = await request(app).get('/api/monitors');
    expect(res.status).toBe(401);
  });
});
