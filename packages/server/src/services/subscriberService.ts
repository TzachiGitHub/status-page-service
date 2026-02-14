import prisma from '../lib/prisma.js';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

export async function list(orgId: string, pagination: { page?: number; limit?: number } = {}) {
  const page = pagination.page || 1;
  const limit = pagination.limit || 20;
  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({ where: { orgId }, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.subscriber.count({ where: { orgId } }),
  ]);
  return { data: subscribers, meta: { total, page, limit } };
}

export async function subscribe(email: string, orgId: string) {
  const existing = await prisma.subscriber.findFirst({ where: { email, orgId } });
  if (existing) return { data: existing };
  const subscriber = await prisma.subscriber.create({ data: { email, orgId } });
  return { data: subscriber };
}

export async function confirm(token: string) {
  const subscriber = await prisma.subscriber.findUnique({ where: { token } });
  if (!subscriber) throw new NotFoundError('Invalid confirmation token');
  const updated = await prisma.subscriber.update({ where: { token }, data: { confirmed: true } });
  return { data: updated };
}

export async function unsubscribe(token: string) {
  const subscriber = await prisma.subscriber.findUnique({ where: { token } });
  if (!subscriber) throw new NotFoundError('Invalid unsubscribe token');
  await prisma.subscriber.delete({ where: { token } });
  return { data: { success: true } };
}

export async function remove(id: string, orgId: string) {
  const s = await prisma.subscriber.findFirst({ where: { id, orgId } });
  if (!s) throw new NotFoundError('Subscriber not found');
  await prisma.subscriber.delete({ where: { id } });
  return { data: { id } };
}
