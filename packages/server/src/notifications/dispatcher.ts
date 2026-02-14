import prisma from '../lib/prisma.js';
import { sendEmail } from './email.js';
import { sendWebhook, type WebhookPayload } from './webhook.js';
import { sendSlack, formatMonitorAlert, formatIncidentUpdate } from './slack.js';
import * as templates from './templates.js';

export interface NotificationEvent {
  type: 'monitor.down' | 'monitor.recovery' | 'incident.created' | 'incident.updated';
  data: any;
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function dispatchToChannel(
  channel: { type: string; config: any },
  event: NotificationEvent,
): Promise<boolean> {
  const { type, data } = event;

  switch (channel.type) {
    case 'EMAIL': {
      const emailAddr = (channel.config as any).email;
      if (!emailAddr) return false;
      let tpl: { subject: string; html: string; text: string };
      if (type === 'monitor.down') {
        tpl = templates.monitorDownAlert(data.monitor, data.check?.message || 'Unknown error', new Date().toISOString());
      } else if (type === 'monitor.recovery') {
        tpl = templates.monitorRecoveryAlert(data.monitor, data.alert?.duration || 'unknown');
      } else if (type === 'incident.created') {
        tpl = templates.incidentCreated(data.incident, [], data.update?.message || '');
      } else {
        tpl = templates.incidentUpdated(data.incident, data.update?.message || '');
      }
      return sendEmail({ to: emailAddr, ...tpl });
    }
    case 'WEBHOOK': {
      const url = (channel.config as any).url;
      const secret = (channel.config as any).secret;
      if (!url) return false;
      const payload: WebhookPayload = { event: type, data, timestamp: new Date().toISOString() };
      return sendWebhook(url, payload, secret);
    }
    case 'SLACK': {
      const webhookUrl = (channel.config as any).webhookUrl;
      if (!webhookUrl) return false;
      const msg = type.startsWith('monitor.')
        ? formatMonitorAlert(data.monitor, type === 'monitor.down', data.check?.message || '')
        : formatIncidentUpdate(data.incident, data.update?.message);
      return sendSlack(webhookUrl, msg);
    }
    default:
      console.warn(`[dispatcher] Unknown channel type: ${channel.type}`);
      return false;
  }
}

export async function dispatchNotification(orgId: string, event: NotificationEvent): Promise<void> {
  try {
    // 1. Dispatch to org notification channels
    const channels = await prisma.notificationChannel.findMany({
      where: { orgId, enabled: true },
    });

    const results = await Promise.allSettled(
      channels.map(async (ch: any) => {
        const ok = await dispatchToChannel(ch, event);
        if (!ok) {
          // Retry once after 5s
          await delay(5000);
          return dispatchToChannel(ch, event);
        }
        return true;
      }),
    );

    const failed = results.filter((r: any) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value));
    if (failed.length) {
      console.warn(`[dispatcher] ${failed.length}/${channels.length} channel(s) failed for ${event.type}`);
    }

    // 2. Notify email subscribers for incident events
    if (event.type === 'incident.created' || event.type === 'incident.updated') {
      const subscribers = await prisma.subscriber.findMany({
        where: { orgId, confirmed: true, type: 'EMAIL' },
      });

      let tpl: { subject: string; html: string; text: string };
      if (event.type === 'incident.created') {
        tpl = templates.incidentCreated(event.data.incident, [], event.data.update?.message || '');
      } else {
        tpl = templates.incidentUpdated(event.data.incident, event.data.update?.message || '');
      }

      await Promise.allSettled(
        subscribers.map(async (sub: any) => {
          if (!sub.email) return;
          const ok = await sendEmail({ to: sub.email, ...tpl });
          if (!ok) {
            await delay(5000);
            await sendEmail({ to: sub.email, ...tpl });
          }
        }),
      );
    }
  } catch (err) {
    console.error('[dispatcher] Unexpected error:', err);
  }
}
