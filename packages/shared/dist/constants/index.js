import { ComponentStatus, MonitorStatus, MonitorType, IncidentImpact } from '../types/enums.js';
// ── Status Labels & Colors ──
export const COMPONENT_STATUS_CONFIG = {
    [ComponentStatus.OPERATIONAL]: { label: 'Operational', color: '#22c55e' },
    [ComponentStatus.DEGRADED_PERFORMANCE]: { label: 'Degraded Performance', color: '#eab308' },
    [ComponentStatus.PARTIAL_OUTAGE]: { label: 'Partial Outage', color: '#f97316' },
    [ComponentStatus.MAJOR_OUTAGE]: { label: 'Major Outage', color: '#ef4444' },
    [ComponentStatus.UNDER_MAINTENANCE]: { label: 'Under Maintenance', color: '#3b82f6' },
};
export const MONITOR_STATUS_CONFIG = {
    [MonitorStatus.UP]: { label: 'Up', color: '#22c55e' },
    [MonitorStatus.DOWN]: { label: 'Down', color: '#ef4444' },
    [MonitorStatus.DEGRADED]: { label: 'Degraded', color: '#eab308' },
    [MonitorStatus.PAUSED]: { label: 'Paused', color: '#6b7280' },
    [MonitorStatus.PENDING]: { label: 'Pending', color: '#a3a3a3' },
};
// ── Monitor Types ──
export const MONITOR_TYPE_CONFIG = {
    [MonitorType.HTTP]: { label: 'HTTP(s)', icon: 'globe' },
    [MonitorType.TCP]: { label: 'TCP Port', icon: 'plug' },
    [MonitorType.PING]: { label: 'Ping (ICMP)', icon: 'activity' },
    [MonitorType.SSL]: { label: 'SSL Certificate', icon: 'shield' },
    [MonitorType.HEARTBEAT]: { label: 'Heartbeat', icon: 'heart' },
    [MonitorType.DNS]: { label: 'DNS', icon: 'server' },
};
// ── Check Intervals ──
export const CHECK_INTERVALS = [30, 60, 120, 300, 600];
export const CHECK_INTERVAL_LABELS = {
    30: '30 seconds',
    60: '1 minute',
    120: '2 minutes',
    300: '5 minutes',
    600: '10 minutes',
};
// ── Regions ──
export const DEFAULT_REGIONS = ['us-east', 'us-west', 'eu-west', 'ap-southeast'];
export const REGION_LABELS = {
    'us-east': 'US East',
    'us-west': 'US West',
    'eu-west': 'EU West',
    'ap-southeast': 'AP Southeast',
};
// ── Incident Impact ──
export const INCIDENT_IMPACT_CONFIG = {
    [IncidentImpact.NONE]: { label: 'None', color: '#6b7280' },
    [IncidentImpact.MINOR]: { label: 'Minor', color: '#eab308' },
    [IncidentImpact.MAJOR]: { label: 'Major', color: '#f97316' },
    [IncidentImpact.CRITICAL]: { label: 'Critical', color: '#ef4444' },
    [IncidentImpact.MAINTENANCE]: { label: 'Maintenance', color: '#3b82f6' },
};
// ── HTTP Methods ──
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
//# sourceMappingURL=index.js.map