import { CheckStatus, UptimeBar } from './types';

interface CheckRecord {
  status: CheckStatus;
  responseTime: number | null;
  checkedAt: Date;
}

/**
 * Calculate uptime percentage for a set of checks within a period.
 */
export function calculateUptimeForPeriod(checks: CheckRecord[], periodMs: number): number {
  if (checks.length === 0) return 100;

  const cutoff = Date.now() - periodMs;
  const filtered = checks.filter((c) => c.checkedAt.getTime() >= cutoff);
  if (filtered.length === 0) return 100;

  const upCount = filtered.filter((c) => c.status === 'UP' || c.status === 'DEGRADED').length;
  return Math.round((upCount / filtered.length) * 10000) / 100;
}

/**
 * Calculate average response time from checks.
 */
export function calculateAvgResponseTime(checks: CheckRecord[]): number {
  const withTime = checks.filter((c) => c.responseTime != null && c.responseTime > 0);
  if (withTime.length === 0) return 0;
  const sum = withTime.reduce((acc, c) => acc + (c.responseTime ?? 0), 0);
  return Math.round(sum / withTime.length);
}

/**
 * Generate uptime bars grouped by day.
 */
export function generateUptimeBars(checks: CheckRecord[], days: number): UptimeBar[] {
  const bars: UptimeBar[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const dayStart = new Date(dateStr + 'T00:00:00Z').getTime();
    const dayEnd = dayStart + 86400000;

    const dayChecks = checks.filter(
      (c) => c.checkedAt.getTime() >= dayStart && c.checkedAt.getTime() < dayEnd
    );

    const totalChecks = dayChecks.length;
    const downChecks = dayChecks.filter((c) => c.status === 'DOWN').length;
    const uptimePercent = totalChecks === 0 ? 100 : Math.round(((totalChecks - downChecks) / totalChecks) * 10000) / 100;

    bars.push({ date: dateStr, uptimePercent, totalChecks, downChecks });
  }

  return bars;
}
