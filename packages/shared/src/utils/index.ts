import { CheckStatus, ComponentStatus, MonitorStatus } from '../types/enums.js';
import { COMPONENT_STATUS_CONFIG, MONITOR_STATUS_CONFIG } from '../constants/index.js';
import type { MonitorCheck, UptimeBar } from '../types/interfaces.js';

/**
 * Generate a URL-safe slug from a name.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calculate uptime percentage from an array of checks.
 */
export function calculateUptime(checks: { status: CheckStatus }[]): number {
  if (checks.length === 0) return 100;
  const upCount = checks.filter((c) => c.status === CheckStatus.UP).length;
  return Math.round((upCount / checks.length) * 10000) / 100;
}

/**
 * Format a duration in milliseconds to a human-readable string.
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

const COMPONENT_STATUS_SEVERITY: ComponentStatus[] = [
  ComponentStatus.OPERATIONAL,
  ComponentStatus.UNDER_MAINTENANCE,
  ComponentStatus.DEGRADED_PERFORMANCE,
  ComponentStatus.PARTIAL_OUTAGE,
  ComponentStatus.MAJOR_OUTAGE,
];

/**
 * Get the worst (overall) status from a list of components.
 */
export function getOverallStatus(components: { status: ComponentStatus }[]): ComponentStatus {
  if (components.length === 0) return ComponentStatus.OPERATIONAL;
  let worst = 0;
  for (const c of components) {
    const idx = COMPONENT_STATUS_SEVERITY.indexOf(c.status);
    if (idx > worst) worst = idx;
  }
  return COMPONENT_STATUS_SEVERITY[worst]!;
}

/**
 * Get the display color for a component or monitor status.
 */
export function getStatusColor(status: ComponentStatus | MonitorStatus): string {
  if (status in COMPONENT_STATUS_CONFIG) {
    return COMPONENT_STATUS_CONFIG[status as ComponentStatus].color;
  }
  if (status in MONITOR_STATUS_CONFIG) {
    return MONITOR_STATUS_CONFIG[status as MonitorStatus].color;
  }
  return '#6b7280';
}

/**
 * Generate a random API key string.
 */
export function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const segments = [8, 8, 8, 8];
  return 'sp_' + segments.map((len) => {
    let s = '';
    for (let i = 0; i < len; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  }).join('_');
}

/**
 * Group monitor checks into daily uptime bars.
 */
export function uptimeBars(checks: MonitorCheck[], days: number): UptimeBar[] {
  const now = new Date();
  const bars: UptimeBar[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);

    const dayChecks = checks.filter((c) => c.checkedAt.slice(0, 10) === dateStr);
    const upCount = dayChecks.filter((c) => c.status === CheckStatus.UP).length;
    const total = dayChecks.length;

    bars.push({
      date: dateStr,
      upCount,
      totalCount: total,
      uptime: total === 0 ? 100 : Math.round((upCount / total) * 10000) / 100,
    });
  }

  return bars;
}
