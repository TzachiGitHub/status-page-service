import { z } from 'zod';

export const CreateNotificationChannelSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['EMAIL', 'SLACK', 'WEBHOOK', 'SMS']),
  config: z.record(z.string(), z.unknown()),
  enabled: z.boolean().optional(),
});

export const UpdateNotificationChannelSchema = CreateNotificationChannelSchema.partial();
