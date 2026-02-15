import { z } from 'zod';

export const SubscribeSchema = z.object({
  email: z.string().email(),
  type: z.enum(['EMAIL', 'WEBHOOK', 'SLACK']).optional().default('EMAIL'),
  componentIds: z.array(z.string().uuid()).optional(),
});
