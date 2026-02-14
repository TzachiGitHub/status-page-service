export interface SlackMessage {
  text: string;
  blocks?: SlackBlock[];
  attachments?: SlackAttachment[];
}

interface SlackBlock {
  type: string;
  text?: { type: string; text: string; emoji?: boolean };
  fields?: { type: string; text: string }[];
  elements?: any[];
}

interface SlackAttachment {
  color: string;
  blocks?: SlackBlock[];
}

const COLORS = { down: '#e74c3c', recovery: '#27ae60', degraded: '#f39c12', info: '#3498db' };

export function formatMonitorAlert(monitor: { name: string; url?: string }, isDown: boolean, detail: string): SlackMessage {
  const color = isDown ? COLORS.down : COLORS.recovery;
  const emoji = isDown ? '🔴' : '✅';
  const status = isDown ? 'DOWN' : 'RECOVERED';
  return {
    text: `${emoji} ${monitor.name} is ${status}`,
    attachments: [{
      color,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: `*${emoji} ${monitor.name}* is *${status}*` } },
        { type: 'section', fields: [
          { type: 'mrkdwn', text: `*Monitor:*\n${monitor.name}` },
          { type: 'mrkdwn', text: `*URL:*\n${monitor.url || 'N/A'}` },
          { type: 'mrkdwn', text: `*Detail:*\n${detail}` },
        ]},
      ],
    }],
  };
}

export function formatIncidentUpdate(incident: { title: string; status: string; severity: string }, updateText?: string): SlackMessage {
  const color = incident.severity === 'CRITICAL' ? COLORS.down : incident.severity === 'MAJOR' ? COLORS.degraded : COLORS.info;
  return {
    text: `⚠️ Incident: ${incident.title}`,
    attachments: [{
      color,
      blocks: [
        { type: 'section', text: { type: 'mrkdwn', text: `*⚠️ ${incident.title}*` } },
        { type: 'section', fields: [
          { type: 'mrkdwn', text: `*Status:*\n${incident.status}` },
          { type: 'mrkdwn', text: `*Severity:*\n${incident.severity}` },
        ]},
        ...(updateText ? [{ type: 'section', text: { type: 'mrkdwn', text: updateText } }] : []),
      ],
    }],
  };
}

export async function sendSlack(webhookUrl: string, message: SlackMessage): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`[slack] Webhook returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[slack] Failed to send:', err);
    return false;
  }
}
