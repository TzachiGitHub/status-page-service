import { z } from 'zod';

export const UpdateStatusPageConfigSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
  faviconUrl: z.string().url().optional().nullable(),
  customDomain: z.string().optional().nullable(),
  customCss: z.string().optional().nullable(),
  showUptime: z.boolean().optional(),
  showResponseTime: z.boolean().optional(),
});
