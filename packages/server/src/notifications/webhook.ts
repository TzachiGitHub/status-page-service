import crypto from 'node:crypto';

export interface WebhookPayload {
  event: string;
  data: any;
  timestamp: string;
}

export async function sendWebhook(url: string, payload: WebhookPayload, secret?: string): Promise<boolean> {
  try {
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (secret) {
      const signature = crypto.createHmac('sha256', secret).update(body).digest('hex');
      headers['X-Signature'] = signature;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`[webhook] ${url} returned ${res.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[webhook] Failed to send:', err);
    return false;
  }
}
