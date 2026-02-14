import prisma from '../lib/prisma.js';
import crypto from 'crypto';

class NotFoundError extends Error {
  statusCode = 404;
  code = 'RESOURCE_NOT_FOUND';
}

export async function list(orgId: string) {
  const keys = await prisma.apiKey.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, key: true, expiresAt: true, lastUsedAt: true, createdAt: true },
  });
  // Mask keys - show only last 8 chars
  const masked = keys.map((k: any) => ({ ...k, key: '...' + k.key.slice(-8) }));
  return { data: masked };
}

export async function create(data: { name: string; expiresAt?: string }, orgId: string) {
  const key = `sp_${crypto.randomBytes(32).toString('hex')}`;
  const apiKey = await prisma.apiKey.create({
    data: { name: data.name, key, orgId, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null },
  });
  return { data: apiKey }; // Return full key only on creation
}

export async function revoke(id: string, orgId: string) {
  const k = await prisma.apiKey.findFirst({ where: { id, orgId } });
  if (!k) throw new NotFoundError('API key not found');
  await prisma.apiKey.delete({ where: { id } });
  return { data: { id } };
}
