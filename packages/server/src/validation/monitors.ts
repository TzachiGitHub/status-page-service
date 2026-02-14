import { z } from 'zod';

export const CreateMonitorSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['HTTP', 'TCP', 'PING', 'DNS', 'SSL', 'HEARTBEAT']),
  url: z.string().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).optional(),
  interval: z.number().int().min(10).max(3600).optional(),
  timeout: z.number().int().min(1).max(120).optional(),
  componentId: z.string().uuid().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  expectedStatus: z.number().int().optional(),
});

export const UpdateMonitorSchema = CreateMonitorSchema.partial();
