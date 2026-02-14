import prisma from '../lib/prisma.js';
import { IncidentStatus } from '@prisma/client';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

export async function list(orgId: string, filters: { page?: number; limit?: number; status?: string } = {}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const where: any = { orgId };
  if (filters.status) where.status = filters.status;

  const [incidents, total] = await Promise.all([
    prisma.incident.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { updates: { orderBy: { createdAt: 'desc' }, take: 1 }, components: { include: { component: true } } },
    }),
    prisma.incident.count({ where }),
  ]);
  return { data: incidents, meta: { total, page, limit } };
}

export async function getById(id: string, orgId: string) {
  const incident = await prisma.incident.findFirst({
    where: { id, orgId },
    include: { updates: { orderBy: { createdAt: 'desc' } }, components: { include: { component: true } } },
  });
  if (!incident) throw new NotFoundError('Incident not found');
  return { data: incident };
}

export async function create(data: { title: string; status?: string; severity?: string; message: string; componentIds?: string[]; componentStatus?: string }, orgId: string) {
  const { componentIds, componentStatus, message, ...incidentData } = data;
  const incident = await prisma.incident.create({
    data: {
      ...incidentData as any,
      orgId,
      updates: { create: { status: (incidentData.status as IncidentStatus) || 'INVESTIGATING', message } },
      ...(componentIds?.length ? {
        components: {
          create: componentIds.map(componentId => ({
            componentId,
            status: (componentStatus as any) || 'MAJOR_OUTAGE',
          })),
        },
      } : {}),
    },
    include: { updates: true, components: { include: { component: true } } },
  });
  return { data: incident };
}

export async function update(id: string, data: any, orgId: string) {
  const existing = await prisma.incident.findFirst({ where: { id, orgId } });
  if (!existing) throw new NotFoundError('Incident not found');
  const resolvedAt = data.status === 'RESOLVED' ? new Date() : undefined;
  const incident = await prisma.incident.update({ where: { id }, data: { ...data, ...(resolvedAt ? { resolvedAt } : {}) } });
  return { data: incident };
}

export async function remove(id: string, orgId: string) {
  const existing = await prisma.incident.findFirst({ where: { id, orgId } });
  if (!existing) throw new NotFoundError('Incident not found');
  await prisma.incident.delete({ where: { id } });
  return { data: { id } };
}

export async function addUpdate(incidentId: string, data: { status: string; message: string }, orgId: string) {
  const incident = await prisma.incident.findFirst({ where: { id: incidentId, orgId } });
  if (!incident) throw new NotFoundError('Incident not found');
  const resolvedAt = data.status === 'RESOLVED' ? new Date() : undefined;
  const [incidentUpdate] = await prisma.$transaction([
    prisma.incidentUpdate.create({ data: { incidentId, status: data.status as IncidentStatus, message: data.message } }),
    prisma.incident.update({ where: { id: incidentId }, data: { status: data.status as IncidentStatus, ...(resolvedAt ? { resolvedAt } : {}) } }),
  ]);
  return { data: incidentUpdate };
}

export async function createScheduledMaintenance(data: { title: string; message: string; componentIds?: string[] }, orgId: string) {
  return create({ ...data, status: 'MONITORING', severity: 'MINOR' }, orgId);
}
