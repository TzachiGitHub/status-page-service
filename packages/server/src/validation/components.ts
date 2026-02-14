import { z } from 'zod';

export const CreateComponentSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['OPERATIONAL', 'DEGRADED_PERFORMANCE', 'PARTIAL_OUTAGE', 'MAJOR_OUTAGE', 'UNDER_MAINTENANCE']).optional(),
  groupId: z.string().uuid().optional().nullable(),
  order: z.number().int().optional(),
});

export const UpdateComponentSchema = CreateComponentSchema.partial();

export const ReorderComponentsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
});

export const CreateComponentGroupSchema = z.object({
  name: z.string().min(1).max(255),
  order: z.number().int().optional(),
});

export const UpdateComponentGroupSchema = CreateComponentGroupSchema.partial();
