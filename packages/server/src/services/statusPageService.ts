import prisma from '../lib/prisma.js';
import { MonitorStatus } from '@prisma/client';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

export async function getConfig(orgId: string) {
  const config = await prisma.statusPageConfig.findUnique({ where: { orgId } });
  return { data: config };
}

export async function updateConfig(orgId: string, data: any) {
  const config = await prisma.statusPageConfig.upsert({
    where: { orgId },
    update: data,
    create: { ...data, orgId, title: data.title || 'Status Page' },
  });
  return { data: config };
}

async function getOrgBySlug(slug: string) {
  const org = await prisma.organization.findUnique({ where: { slug } });
  if (!org) throw new NotFoundError('Status page not found');
  return org;
}

export async function getPublicStatus(slug: string) {
  const org = await getOrgBySlug(slug);
  const [config, components, groups] = await Promise.all([
    prisma.statusPageConfig.findUnique({ where: { orgId: org.id } }),
    prisma.component.findMany({ where: { orgId: org.id }, orderBy: { order: 'asc' }, include: { group: true } }),
    prisma.componentGroup.findMany({ where: { orgId: org.id }, orderBy: { order: 'asc' } }),
  ]);

  const allOperational = components.every((c: any) => c.status === 'OPERATIONAL');
  const hasMajor = components.some((c: any) => c.status === 'MAJOR_OUTAGE');
  const overallStatus = hasMajor ? 'major_outage' : allOperational ? 'operational' : 'degraded';

  return {
    data: {
      name: org.name,
      config,
      overallStatus,
      components,
      groups,
    },
  };
}

export async function getPublicIncidents(slug: string) {
  const org = await getOrgBySlug(slug);
  const incidents = await prisma.incident.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { updates: { orderBy: { createdAt: 'desc' } }, components: { include: { component: true } } },
  });
  return { data: incidents };
}

export async function getPublicUptime(slug: string, days: number = 90) {
  const org = await getOrgBySlug(slug);
  const components = await prisma.component.findMany({ where: { orgId: org.id }, orderBy: { order: 'asc' } });
  const since = new Date(Date.now() - days * 86400000);

  const uptimeData = await Promise.all(
    components.map(async (component: any) => {
      const monitors = await prisma.monitor.findMany({ where: { componentId: component.id } });
      if (monitors.length === 0) return { componentId: component.id, name: component.name, uptime: 100 };
      const monitorIds = monitors.map((m: any) => m.id);
      const [total, up] = await Promise.all([
        prisma.monitorCheck.count({ where: { monitorId: { in: monitorIds }, checkedAt: { gte: since } } }),
        prisma.monitorCheck.count({ where: { monitorId: { in: monitorIds }, checkedAt: { gte: since }, status: MonitorStatus.UP } }),
      ]);
      return { componentId: component.id, name: component.name, uptime: total > 0 ? Math.round((up / total) * 10000) / 100 : 100 };
    })
  );
  return { data: uptimeData };
}

export async function getPublicMetrics(slug: string) {
  const org = await getOrgBySlug(slug);
  const monitors = await prisma.monitor.findMany({ where: { orgId: org.id, enabled: true }, include: { component: true } });
  const since = new Date(Date.now() - 86400000);

  const metrics = await Promise.all(
    monitors.map(async (monitor: any) => {
      const checks = await prisma.monitorCheck.findMany({
        where: { monitorId: monitor.id, checkedAt: { gte: since }, responseTime: { not: null } },
        select: { checkedAt: true, responseTime: true },
        orderBy: { checkedAt: 'asc' },
      });
      return { monitorId: monitor.id, name: monitor.name, component: monitor.component?.name, data: checks };
    })
  );
  return { data: metrics };
}
