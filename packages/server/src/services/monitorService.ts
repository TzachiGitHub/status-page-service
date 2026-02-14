import prisma from '../lib/prisma.js';
import { MonitorStatus } from '@prisma/client';

export async function list(orgId: string, filters: { page?: number; limit?: number; status?: string; type?: string } = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where: any = { orgId };
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;

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
  const page = pagination.page || 1;
  const limit = pagination.limit || 50;
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
