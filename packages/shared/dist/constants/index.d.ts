import { ComponentStatus, MonitorStatus, MonitorType, IncidentImpact } from '../types/enums.js';
export declare const COMPONENT_STATUS_CONFIG: Record<ComponentStatus, {
    label: string;
    color: string;
}>;
export declare const MONITOR_STATUS_CONFIG: Record<MonitorStatus, {
    label: string;
    color: string;
}>;
export declare const MONITOR_TYPE_CONFIG: Record<MonitorType, {
    label: string;
    icon: string;
}>;
export declare const CHECK_INTERVALS: readonly [30, 60, 120, 300, 600];
export declare const CHECK_INTERVAL_LABELS: Record<number, string>;
export declare const DEFAULT_REGIONS: readonly ["us-east", "us-west", "eu-west", "ap-southeast"];
export declare const REGION_LABELS: Record<string, string>;
export declare const INCIDENT_IMPACT_CONFIG: Record<IncidentImpact, {
    label: string;
    color: string;
}>;
export declare const HTTP_METHODS: readonly ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
//# sourceMappingURL=index.d.ts.map