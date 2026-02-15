import { z } from 'zod';

const BaseMonitorSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['HTTP', 'TCP', 'PING', 'DNS', 'SSL', 'HEARTBEAT']),
  url: z.string().url().optional(),
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).optional(),
  interval: z.number().int().min(10).max(3600).optional(),
  timeout: z.number().int().min(1).max(120).optional(),
  componentId: z.string().uuid().optional().nullable(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.string().optional(),
  expectedStatus: z.number().int().optional(),
  host: z.string().optional(),
  port: z.number().int().min(1).max(65535).optional(),
  config: z.record(z.string(), z.unknown()).optional(),
  regions: z.array(z.string()).optional(),
  alertAfter: z.number().int().min(1).optional(),
  recoverAfter: z.number().int().min(1).optional(),
});

export const CreateMonitorSchema = BaseMonitorSchema.superRefine((data, ctx) => {
  if (data.type === 'HTTP' && !data.url) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'URL is required for HTTP monitors', path: ['url'] });
  }
  if (data.type === 'TCP') {
    if (!data.host) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Host is required for TCP monitors', path: ['host'] });
    if (!data.port) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Port is required for TCP monitors', path: ['port'] });
  }
  if (data.type === 'PING' && !data.host) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Host is required for PING monitors', path: ['host'] });
  }
  if (data.type === 'DNS' && !data.host) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Host is required for DNS monitors', path: ['host'] });
  }
  if (data.type === 'SSL' && !data.host) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Host is required for SSL monitors', path: ['host'] });
  }
});

// Type cannot be changed via update to prevent inconsistent state
export const UpdateMonitorSchema = BaseMonitorSchema.omit({ type: true }).partial();
