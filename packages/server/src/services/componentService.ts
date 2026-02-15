import prisma from '../lib/prisma.js';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

export async function list(orgId: string) {
  const components = await prisma.component.findMany({
    where: { orgId },
    orderBy: { order: 'asc' },
    include: { group: true },
  });
  return { data: components };
}

export async function create(data: any, orgId: string) {
  const existing = await prisma.component.findFirst({ where: { orgId, name: data.name } });
  if (existing) {
    const err = new Error('A component with this name already exists in your organization') as Error & { statusCode: number; code: string };
    err.statusCode = 409;
    err.code = 'DUPLICATE_NAME';
    throw err;
  }
  const component = await prisma.component.create({ data: { ...data, orgId } });
  return { data: component };
}

export async function getById(id: string, orgId: string) {
  const c = await prisma.component.findFirst({ where: { id, orgId }, include: { group: true } });
  if (!c) throw new NotFoundError('Component not found');
  return { data: c };
}

export async function update(id: string, data: any, orgId: string) {
  const c = await prisma.component.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError('Component not found');
  const component = await prisma.component.update({ where: { id }, data });
  return { data: component };
}

export async function remove(id: string, orgId: string) {
  const c = await prisma.component.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError('Component not found');
  await prisma.component.delete({ where: { id } });
  return { data: { id } };
}

export async function reorder(ids: string[], orgId: string) {
  // Validate all IDs exist in this org
  const existing = await prisma.component.findMany({ where: { id: { in: ids }, orgId }, select: { id: true } });
  const existingIds = new Set(existing.map((c: { id: string }) => c.id));
  const missing = ids.filter((id) => !existingIds.has(id));
  if (missing.length > 0) {
    const err = new Error(`Components not found: ${missing.join(', ')}`) as Error & { statusCode: number; code: string };
    err.statusCode = 400;
    err.code = 'INVALID_IDS';
    throw err;
  }
  const updates = ids.map((id, index) =>
    prisma.component.updateMany({ where: { id, orgId }, data: { order: index } })
  );
  await prisma.$transaction(updates);
  return { data: { success: true } };
}

export async function getStatusHistory(id: string, days: number = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const history = await prisma.incidentComponent.findMany({
    where: { componentId: id, incident: { createdAt: { gte: since } } },
    include: { incident: { select: { title: true, createdAt: true, resolvedAt: true, status: true } } },
    orderBy: { incident: { createdAt: 'desc' } },
  });
  return { data: history };
}
