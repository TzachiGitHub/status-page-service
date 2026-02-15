import { z } from 'zod';

export const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  expiresAt: z.string().datetime().optional().refine(
    (val) => {
      if (!val) return true;
      return new Date(val) > new Date();
    },
    { message: 'Expiration date must be in the future' }
  ),
});
