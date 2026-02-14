import { describe, it, expect, vi, beforeEach } from 'vitest';
import { httpCheck } from '../monitor/checks/http';
import { evaluateAlert } from '../monitor/alerter';
import { calculateUptimeForPeriod, calculateAvgResponseTime, generateUptimeBars } from '../monitor/uptime';
import { calculateDaysUntilExpiry } from '../monitor/checks/ssl';
import { heartbeatCheck } from '../monitor/checks/heartbeat';

// ─── HTTP Checker Tests ───

describe('httpCheck', () => {
  it('should return UP for a 200 response', async () => {
    // Mock fetch
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      text: async () => 'OK',
    });

    const result = await httpCheck({
      target: 'https://example.com',
      method: 'GET',
      timeout: 5000,
    });

    expect(result.status).toBe('UP');
    expect(result.statusCode).toBe(200);
    expect(result.responseTime).toBeGreaterThanOrEqual(0);
  });

  it('should return DOWN for unexpected status code', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 500,
      text: async () => 'Error',
    });

    const result = await httpCheck({
      target: 'https://example.com',
      method: 'GET',
      timeout: 5000,
      expectedStatus: 200,
    });

    expect(result.status).toBe('DOWN');
    expect(result.statusCode).toBe(500);
    expect(result.error).toContain('Expected status 200');
  });

  it('should return DOWN on timeout', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => {
      const err = new Error('aborted');
      err.name = 'AbortError';
      return Promise.reject(err);
    });

    const result = await httpCheck({
      target: 'https://example.com',
      method: 'GET',
      timeout: 100,
    });

    expect(result.status).toBe('DOWN');
    expect(result.error).toContain('Timeout');
  });

  it('should return DOWN when keyword not found (CONTAINS)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      text: async () => 'Hello World',
    });

    const result = await httpCheck({
      target: 'https://example.com',
      method: 'GET',
      timeout: 5000,
      keyword: 'foobar',
      keywordType: 'CONTAINS',
    });

    expect(result.status).toBe('DOWN');
    expect(result.error).toContain('not found');
  });

  it('should return UP when keyword found (CONTAINS)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      text: async () => 'Hello World',
    });

    const result = await httpCheck({
      target: 'https://example.com',
      method: 'GET',
      timeout: 5000,
      keyword: 'Hello',
      keywordType: 'CONTAINS',
    });

    expect(result.status).toBe('UP');
  });

  it('should return DOWN when keyword found (NOT_CONTAINS)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      status: 200,
      text: async () => 'Error: something broke',
    });

    const result = await httpCheck({
      target: 'https://example.com',
      method: 'GET',
      timeout: 5000,
      keyword: 'Error',
      keywordType: 'NOT_CONTAINS',
    });

    expect(result.status).toBe('DOWN');
    expect(result.error).toContain('should not contain');
  });

  it('should return DOWN on connection error', async () => {
    const err: any = new Error('fetch failed');
    err.cause = { code: 'ECONNREFUSED' };
    globalThis.fetch = vi.fn().mockRejectedValue(err);

    const result = await httpCheck({
      target: 'https://example.com',
      method: 'GET',
      timeout: 5000,
    });

    expect(result.status).toBe('DOWN');
    expect(result.error).toBe('Connection refused');
  });
});

// ─── Alert Evaluator Tests ───

describe('evaluateAlert', () => {
  it('should trigger DOWN alert after N consecutive failures', () => {
    const result = evaluateAlert({
      monitorId: 'm1',
      monitorName: 'Test',
      currentStatus: 'UP',
      alertAfter: 3,
      recoveryAfter: 2,
      recentChecks: [
        { status: 'DOWN' },
        { status: 'DOWN' },
        { status: 'DOWN' },
      ],
    });

    expect(result).not.toBeNull();
    expect(result!.type).toBe('DOWN');
  });

  it('should NOT trigger DOWN alert if not enough consecutive failures', () => {
    const result = evaluateAlert({
      monitorId: 'm1',
      monitorName: 'Test',
      currentStatus: 'UP',
      alertAfter: 3,
      recoveryAfter: 2,
      recentChecks: [
        { status: 'DOWN' },
        { status: 'DOWN' },
        { status: 'UP' },
      ],
    });

    expect(result).toBeNull();
  });

  it('should trigger RECOVERY alert after N consecutive successes when DOWN', () => {
    const result = evaluateAlert({
      monitorId: 'm1',
      monitorName: 'Test',
      currentStatus: 'DOWN',
      alertAfter: 2,
      recoveryAfter: 2,
      recentChecks: [
        { status: 'UP' },
        { status: 'UP' },
      ],
    });

    expect(result).not.toBeNull();
    expect(result!.type).toBe('RECOVERY');
  });

  it('should NOT trigger RECOVERY if monitor is already UP', () => {
    const result = evaluateAlert({
      monitorId: 'm1',
      monitorName: 'Test',
      currentStatus: 'UP',
      alertAfter: 2,
      recoveryAfter: 2,
      recentChecks: [
        { status: 'UP' },
        { status: 'UP' },
      ],
    });

    expect(result).toBeNull();
  });

  it('should NOT trigger DOWN if already DOWN', () => {
    const result = evaluateAlert({
      monitorId: 'm1',
      monitorName: 'Test',
      currentStatus: 'DOWN',
      alertAfter: 1,
      recoveryAfter: 1,
      recentChecks: [{ status: 'DOWN' }],
    });

    expect(result).toBeNull();
  });
});

// ─── Uptime Calculator Tests ───

describe('uptime calculator', () => {
  const makeCheck = (status: 'UP' | 'DOWN' | 'DEGRADED', hoursAgo: number, responseTime = 100) => ({
    status,
    responseTime,
    checkedAt: new Date(Date.now() - hoursAgo * 3600000),
  });

  it('should calculate 100% uptime when all checks UP', () => {
    const checks = [makeCheck('UP', 1), makeCheck('UP', 2), makeCheck('UP', 3)];
    expect(calculateUptimeForPeriod(checks, 24 * 3600000)).toBe(100);
  });

  it('should calculate 50% uptime with mixed checks', () => {
    const checks = [makeCheck('UP', 1), makeCheck('DOWN', 2)];
    expect(calculateUptimeForPeriod(checks, 24 * 3600000)).toBe(50);
  });

  it('should count DEGRADED as up for uptime', () => {
    const checks = [makeCheck('DEGRADED', 1), makeCheck('UP', 2)];
    expect(calculateUptimeForPeriod(checks, 24 * 3600000)).toBe(100);
  });

  it('should return 100% for empty checks', () => {
    expect(calculateUptimeForPeriod([], 24 * 3600000)).toBe(100);
  });

  it('should calculate average response time', () => {
    const checks = [makeCheck('UP', 1, 100), makeCheck('UP', 2, 200), makeCheck('UP', 3, 300)];
    expect(calculateAvgResponseTime(checks)).toBe(200);
  });

  it('should generate uptime bars', () => {
    const now = new Date();
    const checks = [
      { status: 'UP' as const, responseTime: 50, checkedAt: now },
      { status: 'DOWN' as const, responseTime: 0, checkedAt: now },
    ];

    const bars = generateUptimeBars(checks, 3);
    expect(bars).toHaveLength(3);
    // Today's bar should have 2 checks
    const todayBar = bars[bars.length - 1];
    expect(todayBar.totalChecks).toBe(2);
    expect(todayBar.downChecks).toBe(1);
    expect(todayBar.uptimePercent).toBe(50);
  });
});

// ─── SSL Expiry Tests ───

describe('SSL expiry calculation', () => {
  it('should calculate days until expiry correctly', () => {
    const futureDate = new Date(Date.now() + 30 * 86400000);
    const days = calculateDaysUntilExpiry(futureDate);
    expect(days).toBeGreaterThanOrEqual(29);
    expect(days).toBeLessThanOrEqual(30);
  });

  it('should return negative for expired cert', () => {
    const pastDate = new Date(Date.now() - 5 * 86400000);
    const days = calculateDaysUntilExpiry(pastDate);
    expect(days).toBeLessThan(0);
  });
});

// ─── Heartbeat Checker Tests ───

describe('heartbeatCheck', () => {
  it('should return UP if heartbeat within grace period', () => {
    const result = heartbeatCheck({
      lastCheckedAt: new Date(Date.now() - 60000), // 60s ago
      gracePeriod: 300,
    });
    expect(result.status).toBe('UP');
  });

  it('should return DOWN if heartbeat expired', () => {
    const result = heartbeatCheck({
      lastCheckedAt: new Date(Date.now() - 600000), // 600s ago
      gracePeriod: 300,
    });
    expect(result.status).toBe('DOWN');
  });

  it('should return DOWN if no heartbeat received', () => {
    const result = heartbeatCheck({
      lastCheckedAt: null,
      gracePeriod: 300,
    });
    expect(result.status).toBe('DOWN');
    expect(result.error).toContain('No heartbeat');
  });
});
