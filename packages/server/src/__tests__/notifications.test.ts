import { describe, it, expect, vi, beforeEach } from 'vitest';
import crypto from 'node:crypto';

// ── Email tests ──────────────────────────────────────────

describe('email dispatcher', () => {
  it('sends email with correct config', async () => {
    const mockSendMail = vi.fn().mockResolvedValue({ messageId: '123' });
    
    // Import and override transporter
    const { sendEmail, setTransporter } = await import('../notifications/email.js');
    setTransporter({ sendMail: mockSendMail } as any);

    const result = await sendEmail({ to: 'test@example.com', subject: 'Test', html: '<p>Hi</p>' });
    expect(result).toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com',
      subject: 'Test',
      html: '<p>Hi</p>',
    }));

    setTransporter(null);
  });

  it('returns false on send failure', async () => {
    const mockSendMail = vi.fn().mockRejectedValue(new Error('SMTP error'));
    const { sendEmail, setTransporter } = await import('../notifications/email.js');
    setTransporter({ sendMail: mockSendMail } as any);

    const result = await sendEmail({ to: 'fail@example.com', subject: 'Fail', html: '' });
    expect(result).toBe(false);

    setTransporter(null);
  });
});

// ── Webhook tests ────────────────────────────────────────

describe('webhook dispatcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends correct payload', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const { sendWebhook } = await import('../notifications/webhook.js');
    const payload = { event: 'monitor.down', data: { id: '1' }, timestamp: '2024-01-01T00:00:00Z' };
    const result = await sendWebhook('https://example.com/hook', payload);

    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://example.com/hook', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  });

  it('includes X-Signature when secret provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const { sendWebhook } = await import('../notifications/webhook.js');
    const payload = { event: 'monitor.down', data: {}, timestamp: '2024-01-01T00:00:00Z' };
    await sendWebhook('https://example.com/hook', payload, 'mysecret');

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    const body = JSON.stringify(payload);
    const expected = crypto.createHmac('sha256', 'mysecret').update(body).digest('hex');
    expect(callHeaders['X-Signature']).toBe(expected);
  });

  it('returns false on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));

    const { sendWebhook } = await import('../notifications/webhook.js');
    const result = await sendWebhook('https://example.com/hook', { event: 'test', data: {}, timestamp: '' });
    expect(result).toBe(false);
  });
});

// ── Slack tests ──────────────────────────────────────────

describe('slack dispatcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('formats monitor alert blocks correctly', async () => {
    const { formatMonitorAlert } = await import('../notifications/slack.js');
    const msg = formatMonitorAlert({ name: 'API', url: 'https://api.example.com' }, true, 'Timeout');
    
    expect(msg.text).toContain('API');
    expect(msg.text).toContain('DOWN');
    expect(msg.attachments![0].color).toBe('#e74c3c');
  });

  it('sends to slack webhook', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const { sendSlack } = await import('../notifications/slack.js');
    const result = await sendSlack('https://hooks.slack.com/test', { text: 'hello' });
    
    expect(result).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith('https://hooks.slack.com/test', expect.objectContaining({
      method: 'POST',
    }));
  });
});

// ── SSE Manager tests ────────────────────────────────────

describe('SSE manager', () => {
  it('adds and removes connections', async () => {
    const { SSEManager } = await import('../sse/manager.js');
    const mgr = new SSEManager();
    const fakeRes = { write: vi.fn() } as any;

    mgr.addConnection('org1', 'dashboard', fakeRes);
    expect(mgr.getConnectionCount('org1')).toBe(1);

    mgr.removeConnection('org1', 'dashboard', fakeRes);
    expect(mgr.getConnectionCount('org1')).toBe(0);
  });

  it('broadcasts only to correct org', async () => {
    const { SSEManager } = await import('../sse/manager.js');
    const mgr = new SSEManager();
    const res1 = { write: vi.fn() } as any;
    const res2 = { write: vi.fn() } as any;

    mgr.addConnection('org1', 'dashboard', res1);
    mgr.addConnection('org2', 'dashboard', res2);

    mgr.broadcast('org1', 'dashboard', { type: 'test', data: { x: 1 } });

    expect(res1.write).toHaveBeenCalled();
    expect(res2.write).not.toHaveBeenCalled();
  });

  it('broadcastAll sends to both dashboard and public', async () => {
    const { SSEManager } = await import('../sse/manager.js');
    const mgr = new SSEManager();
    const dashRes = { write: vi.fn() } as any;
    const pubRes = { write: vi.fn() } as any;

    mgr.addConnection('org1', 'dashboard', dashRes);
    mgr.addConnection('org1', 'public', pubRes);

    mgr.broadcastAll('org1', { type: 'test', data: {} });

    expect(dashRes.write).toHaveBeenCalled();
    expect(pubRes.write).toHaveBeenCalled();
  });
});

// ── Dispatcher routing tests ─────────────────────────────

describe('dispatcher', () => {
  it('routes to webhook channel', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    // Mock prisma
    vi.mock('../lib/prisma.js', () => ({
      default: {
        notificationChannel: {
          findMany: vi.fn().mockResolvedValue([
            { id: '1', type: 'WEBHOOK', config: { url: 'https://example.com/hook' }, enabled: true },
          ]),
        },
        subscriber: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
    }));

    const { dispatchNotification } = await import('../notifications/dispatcher.js');
    await dispatchNotification('org1', {
      type: 'monitor.down',
      data: { monitor: { name: 'Test' }, check: { message: 'err' } },
    });

    expect(mockFetch).toHaveBeenCalled();
  });

  it('handles channel failure gracefully', { timeout: 15000 }, async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')));

    vi.mock('../lib/prisma.js', () => ({
      default: {
        notificationChannel: {
          findMany: vi.fn().mockResolvedValue([
            { id: '1', type: 'WEBHOOK', config: { url: 'https://fail.com' }, enabled: true },
          ]),
        },
        subscriber: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      },
    }));

    const { dispatchNotification } = await import('../notifications/dispatcher.js');
    // Should not throw
    await expect(
      dispatchNotification('org1', {
        type: 'monitor.down',
        data: { monitor: { name: 'Test' }, check: {} },
      }),
    ).resolves.toBeUndefined();
  });
});
