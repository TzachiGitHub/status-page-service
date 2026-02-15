import { z } from 'zod';

const SlackConfigSchema = z.object({
  webhookUrl: z.string().url().refine(url => url.startsWith('https://'), { message: 'Webhook URL must use HTTPS' }),
});

const WebhookConfigSchema = z.object({
  url: z.string().url().refine(url => url.startsWith('https://') || url.startsWith('http://'), { message: 'URL must use HTTP or HTTPS' })
    .refine(url => !url.startsWith('javascript:'), { message: 'Invalid URL scheme' }),
});

const EmailConfigSchema = z.object({
  addresses: z.array(z.string().email()).min(1, 'At least one email address is required'),
});

const SmsConfigSchema = z.object({
  phoneNumbers: z.array(z.string().min(1)).min(1, 'At least one phone number is required'),
});

export const CreateNotificationChannelSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['EMAIL', 'SLACK', 'WEBHOOK', 'SMS']),
  config: z.record(z.string(), z.unknown()),
  enabled: z.boolean().optional(),
}).superRefine((data, ctx) => {
  let result;
  switch (data.type) {
    case 'SLACK':
      result = SlackConfigSchema.safeParse(data.config);
      break;
    case 'WEBHOOK':
      result = WebhookConfigSchema.safeParse(data.config);
      break;
    case 'EMAIL':
      result = EmailConfigSchema.safeParse(data.config);
      break;
    case 'SMS':
      result = SmsConfigSchema.safeParse(data.config);
      break;
  }
  if (result && !result.success) {
    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['config', ...issue.path],
        message: issue.message,
      });
    }
  }
});

export const UpdateNotificationChannelSchema = CreateNotificationChannelSchema.partial();
