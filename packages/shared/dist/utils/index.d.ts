import { CheckStatus, ComponentStatus, MonitorStatus } from '../types/enums.js';
import type { MonitorCheck, UptimeBar } from '../types/interfaces.js';
/**
 * Generate a URL-safe slug from a name.
 */
export declare function slugify(name: string): string;
/**
 * Calculate uptime percentage from an array of checks.
 */
export declare function calculateUptime(checks: {
    status: CheckStatus;
}[]): number;
/**
 * Format a duration in milliseconds to a human-readable string.
 */
export declare function formatDuration(ms: number): string;
/**
 * Get the worst (overall) status from a list of components.
 */
export declare function getOverallStatus(components: {
    status: ComponentStatus;
}[]): ComponentStatus;
/**
 * Get the display color for a component or monitor status.
 */
export declare function getStatusColor(status: ComponentStatus | MonitorStatus): string;
/**
 * Generate a random API key string.
 */
export declare function generateApiKey(): string;
/**
 * Group monitor checks into daily uptime bars.
 */
export declare function uptimeBars(checks: MonitorCheck[], days: number): UptimeBar[];
//# sourceMappingURL=index.d.ts.map