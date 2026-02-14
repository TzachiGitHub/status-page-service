import { ComponentStatus, OverallStatus, StatusComponent } from '../types';

export const STATUS_CONFIG: Record<
  ComponentStatus,
  { label: string; color: string; dotClass: string }
> = {
  operational: { label: 'Operational', color: '#10b981', dotClass: 'bg-emerald-500' },
  degraded_performance: { label: 'Degraded Performance', color: '#f59e0b', dotClass: 'bg-amber-500' },
  partial_outage: { label: 'Partial Outage', color: '#f97316', dotClass: 'bg-orange-500' },
  major_outage: { label: 'Major Outage', color: '#ef4444', dotClass: 'bg-red-500' },
  under_maintenance: { label: 'Under Maintenance', color: '#3b82f6', dotClass: 'bg-blue-500' },
};

export const IMPACT_CONFIG: Record<string, { label: string; className: string }> = {
  none: { label: 'None', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  minor: { label: 'Minor', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  major: { label: 'Major', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  critical: { label: 'Critical', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export function calcOverallStatus(components: StatusComponent[]): OverallStatus {
  if (!components.length) return 'operational';
  const hasOutage = components.some(
    (c) => c.status === 'major_outage' || c.status === 'partial_outage'
  );
  const hasDegraded = components.some(
    (c) => c.status === 'degraded_performance' || c.status === 'under_maintenance'
  );
  if (components.every((c) => c.status === 'major_outage')) return 'major';
  if (hasOutage) return 'partial';
  if (hasDegraded) return 'partial';
  return 'operational';
}

export function groupComponents(components: StatusComponent[]) {
  const groups: Record<string, StatusComponent[]> = {};
  const ungrouped: StatusComponent[] = [];
  for (const c of components) {
    if (c.group) {
      (groups[c.group] ??= []).push(c);
    } else {
      ungrouped.push(c);
    }
  }
  return { groups, ungrouped };
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}
