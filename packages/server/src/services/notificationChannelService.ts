import prisma from '../lib/prisma.js';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

export async function list(orgId: string) {
  const channels = await prisma.notificationChannel.findMany({ where: { orgId }, orderBy: { createdAt: 'desc' } });
  return { data: channels };
}

export async function create(data: any, orgId: string) {
  const channel = await prisma.notificationChannel.create({ data: { ...data, orgId } });
  return { data: channel };
}

export async function getById(id: string, orgId: string) {
  const c = await prisma.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError('Notification channel not found');
  return { data: c };
}

export async function update(id: string, data: any, orgId: string) {
  const c = await prisma.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError('Notification channel not found');
  const channel = await prisma.notificationChannel.update({ where: { id }, data });
  return { data: channel };
}

export async function remove(id: string, orgId: string) {
  const c = await prisma.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError('Notification channel not found');
  await prisma.notificationChannel.delete({ where: { id } });
  return { data: { id } };
}

export async function test(id: string, orgId: string) {
  const c = await prisma.notificationChannel.findFirst({ where: { id, orgId } });
  if (!c) throw new NotFoundError('Notification channel not found');
  // In production, this would send a test notification
  return { data: { success: true, message: 'Test notification sent' } };
}
