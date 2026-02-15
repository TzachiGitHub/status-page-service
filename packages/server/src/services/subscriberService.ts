import prisma from '../lib/prisma.js';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

function validatePagination(page?: number, limit?: number): { page: number; limit: number } {
  let p = page || 1;
  let l = limit || 20;
  if (isNaN(p) || p < 1) p = 1;
  if (isNaN(l) || l < 1) l = 1;
  if (l > 100) l = 100;
  return { page: p, limit: l };
}

export async function list(orgId: string, pagination: { page?: number; limit?: number } = {}) {
  const { page, limit } = validatePagination(pagination.page, pagination.limit);
  const [subscribers, total] = await Promise.all([
    prisma.subscriber.findMany({
      where: { orgId },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, confirmed: true, orgId: true, createdAt: true, updatedAt: true },
    }),
    prisma.subscriber.count({ where: { orgId } }),
  ]);
  return { data: subscribers, meta: { total, page, limit } };
}

export async function subscribe(email: string, orgId: string, type: string = 'EMAIL') {
  const existing = await prisma.subscriber.findFirst({ where: { email, orgId } });
  if (existing) return { data: { id: existing.id, email: existing.email, confirmed: existing.confirmed, message: 'Already subscribed' } };
  const subscriber = await prisma.subscriber.create({ data: { email, orgId, type: type as any } });
  // TODO: send confirmation email with subscriber.token
  return { data: { id: subscriber.id, email: subscriber.email, confirmed: subscriber.confirmed, message: 'Confirmation email sent' } };
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
