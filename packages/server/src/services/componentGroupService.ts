import prisma from '../lib/prisma.js';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

export async function list(orgId: string) {
  const groups = await prisma.componentGroup.findMany({
    where: { orgId },
    orderBy: { order: 'asc' },
    include: { components: { orderBy: { order: 'asc' } } },
  });
  return { data: groups };
}

export async function create(data: any, orgId: string) {
  const group = await prisma.componentGroup.create({ data: { ...data, orgId } });
  return { data: group };
}

export async function getById(id: string, orgId: string) {
  const g = await prisma.componentGroup.findFirst({ where: { id, orgId }, include: { components: true } });
  if (!g) throw new NotFoundError('Component group not found');
  return { data: g };
}

export async function update(id: string, data: any, orgId: string) {
  const g = await prisma.componentGroup.findFirst({ where: { id, orgId } });
  if (!g) throw new NotFoundError('Component group not found');
  const group = await prisma.componentGroup.update({ where: { id }, data });
  return { data: group };
}

export async function remove(id: string, orgId: string) {
  const g = await prisma.componentGroup.findFirst({ where: { id, orgId } });
  if (!g) throw new NotFoundError('Component group not found');
  await prisma.componentGroup.delete({ where: { id } });
  return { data: { id } };
}
