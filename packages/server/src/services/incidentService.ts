import prisma from '../lib/prisma.js';
import { IncidentStatus } from '@prisma/client';
import { onIncidentChange } from '../notifications/hooks.js';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

const VALID_INCIDENT_STATUSES = ['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED'];

function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  let p = page || 1;
  let l = limit || 20;
  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(l) || l < 1) l = 1;
  if (l > 100) l = 100;
  return { page: p, limit: l };
}

export async function list(orgId: string, filters: { page?: number; limit?: number; status?: string } = {}) {
  const { page, limit } = validatePagination(filters.page, filters.limit);
  const where: any = { orgId };
  if (filters.status) {
    if (!VALID_INCIDENT_STATUSES.includes(filters.status)) {
      throw Object.assign(new Error(`Invalid status filter. Must be one of: ${VALID_INCIDENT_STATUSES.join(', ')}`), { statusCode: 400, code: 'INVALID_FILTER' });
    }
    where.status = filters.status;
  }

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
  const resolvedAt = incidentData.status === 'RESOLVED' ? new Date() : undefined;
  const incident = await prisma.incident.create({
    data: {
      ...incidentData as any,
      orgId,
      ...(resolvedAt ? { resolvedAt } : {}),
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
  // BUG-015: Sync component status when incident is created
  if (componentIds?.length) {
    const status = (componentStatus as any) || 'MAJOR_OUTAGE';
    await prisma.component.updateMany({
      where: { id: { in: componentIds } },
      data: { status },
    });
  }
  onIncidentChange(orgId, incident).catch(() => {});
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
  const resolvedAt = data.status === 'RESOLVED' ? new Date() : null;
  const [incidentUpdate] = await prisma.$transaction([
    prisma.incidentUpdate.create({ data: { incidentId, status: data.status as IncidentStatus, message: data.message } }),
    prisma.incident.update({ where: { id: incidentId }, data: { status: data.status as IncidentStatus, resolvedAt } }),
  ]);
  // BUG-015: Restore component status to OPERATIONAL when incident is resolved
  if (data.status === 'RESOLVED') {
    const incidentComponents = await prisma.incidentComponent.findMany({
      where: { incidentId },
      select: { componentId: true },
    });
    if (incidentComponents.length > 0) {
      await prisma.component.updateMany({
        where: { id: { in: incidentComponents.map(ic => ic.componentId) } },
        data: { status: 'OPERATIONAL' },
      });
    }
  }
  onIncidentChange(orgId, { id: incidentId, status: data.status }, incidentUpdate).catch(() => {});
  return { data: incidentUpdate };
}

export async function createScheduledMaintenance(
  data: { title: string; message: string; componentIds?: string[]; scheduledStartAt?: string; scheduledEndAt?: string },
  orgId: string
) {
  const { scheduledStartAt, scheduledEndAt, ...rest } = data;
  const result = await create({ ...rest, status: 'MONITORING', severity: 'MINOR' }, orgId);
  // Update with maintenance-specific fields
  if (scheduledStartAt || scheduledEndAt) {
    await prisma.incident.update({
      where: { id: result.data.id },
      data: {
        isMaintenance: true,
        ...(scheduledStartAt ? { scheduledStartAt: new Date(scheduledStartAt) } : {}),
        ...(scheduledEndAt ? { scheduledEndAt: new Date(scheduledEndAt) } : {}),
      },
    });
  } else {
    await prisma.incident.update({
      where: { id: result.data.id },
      data: { isMaintenance: true },
    });
  }
  return result;
}
