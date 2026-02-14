import { z } from 'zod';

export const SubscribeSchema = z.object({
  email: z.string().email(),
  componentIds: z.array(z.string().uuid()).optional(),
});
