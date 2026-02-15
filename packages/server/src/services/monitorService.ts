import prisma from '../lib/prisma.js';
import { MonitorStatus } from '@prisma/client';

const VALID_MONITOR_STATUSES = ['UP', 'DOWN', 'DEGRADED', 'UNKNOWN'];
const VALID_MONITOR_TYPES = ['HTTP', 'TCP', 'PING', 'DNS', 'SSL', 'HEARTBEAT'];

function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  let p = page || 1;
  let l = limit || 20;
  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(l) || l < 1) l = 1;
  if (l > 100) l = 100;
  return { page: p, limit: l };
}

export async function list(orgId: string, filters: { page?: number; limit?: number; status?: string; type?: string } = {}) {
  const { page, limit } = validatePagination(filters.page, filters.limit);
  const where: any = { orgId };
  if (filters.status) {
    if (!VALID_MONITOR_STATUSES.includes(filters.status)) {
      throw Object.assign(new Error(`Invalid status filter. Must be one of: ${VALID_MONITOR_STATUSES.join(', ')}`), { statusCode: 400, code: 'INVALID_FILTER' });
    }
    where.status = filters.status;
  }
  if (filters.type) {
    if (!VALID_MONITOR_TYPES.includes(filters.type)) {
      throw Object.assign(new Error(`Invalid type filter. Must be one of: ${VALID_MONITOR_TYPES.join(', ')}`), { statusCode: 400, code: 'INVALID_FILTER' });
    }
    where.type = filters.type;
  }

  const [monitors, total] = await Promise.all([
    prisma.monitor.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' }, include: { component: true } }),
    prisma.monitor.count({ where }),
  ]);
  return { data: monitors, meta: { total, page, limit } };
}

export async function getById(id: string, orgId: string) {
  const monitor = await prisma.monitor.findFirst({ where: { id, orgId }, include: { component: true } });
  if (!monitor) throw new NotFoundError('Monitor not found');
  return { data: monitor };
}

export async function create(data: any, orgId: string) {
  // BUG-017: Auto-generate heartbeatToken for HEARTBEAT monitors
  if (data.type === 'HEARTBEAT' && !data.heartbeatToken) {
    const { randomUUID } = await import('crypto');
    data.heartbeatToken = randomUUID();
  }
  const monitor = await prisma.monitor.create({ data: { ...data, orgId } });
  return { data: monitor };
}

export async function update(id: string, data: any, orgId: string) {
  await ensureExists(id, orgId);
  const monitor = await prisma.monitor.update({ where: { id }, data });
  return { data: monitor };
}

export async function remove(id: string, orgId: string) {
  await ensureExists(id, orgId);
  await prisma.monitor.delete({ where: { id } });
  return { data: { id } };
}

export async function pause(id: string, orgId: string) {
  await ensureExists(id, orgId);
  const monitor = await prisma.monitor.update({ where: { id }, data: { enabled: false } });
  return { data: monitor };
}

export async function resume(id: string, orgId: string) {
  await ensureExists(id, orgId);
  const monitor = await prisma.monitor.update({ where: { id }, data: { enabled: true } });
  return { data: monitor };
}

export async function getChecks(id: string, orgId: string, pagination: { page?: number; limit?: number } = {}) {
  await ensureExists(id, orgId);
  const { page, limit } = validatePagination(pagination.page, pagination.limit);
  const [checks, total] = await Promise.all([
    prisma.monitorCheck.findMany({ where: { monitorId: id }, skip: (page - 1) * limit, take: limit, orderBy: { checkedAt: 'desc' } }),
    prisma.monitorCheck.count({ where: { monitorId: id } }),
  ]);
  return { data: checks, meta: { total, page, limit } };
}

export async function getUptimeStats(id: string) {
  const ranges = { '24h': 1, '7d': 7, '30d': 30, '90d': 90 };
  const stats: Record<string, number> = {};
  for (const [key, days] of Object.entries(ranges)) {
    const since = new Date(Date.now() - days * 86400000);
    const [total, up] = await Promise.all([
      prisma.monitorCheck.count({ where: { monitorId: id, checkedAt: { gte: since } } }),
      prisma.monitorCheck.count({ where: { monitorId: id, checkedAt: { gte: since }, status: MonitorStatus.UP } }),
    ]);
    stats[key] = total > 0 ? Math.round((up / total) * 10000) / 100 : 100;
  }
  return { data: stats };
}

export async function getResponseTimes(id: string, range: string = '24h') {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 1;
  const since = new Date(Date.now() - days * 86400000);
  const checks = await prisma.monitorCheck.findMany({
    where: { monitorId: id, checkedAt: { gte: since }, responseTime: { not: null } },
    select: { checkedAt: true, responseTime: true },
    orderBy: { checkedAt: 'asc' },
  });
  return { data: checks };
}

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

async function ensureExists(id: string, orgId: string) {
  const m = await prisma.monitor.findFirst({ where: { id, orgId } });
  if (!m) throw new NotFoundError('Monitor not found');
  return m;
}

export { NotFoundError };
