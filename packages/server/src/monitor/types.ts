export type CheckStatus = 'UP' | 'DOWN' | 'DEGRADED';
export type MonitorType = 'HTTP' | 'TCP' | 'PING' | 'SSL' | 'HEARTBEAT' | 'DNS';
export type KeywordType = 'CONTAINS' | 'NOT_CONTAINS';
export type AlertType = 'DOWN' | 'RECOVERY' | 'SSL_EXPIRY' | 'DEGRADED';
export type ComponentStatus = 'OPERATIONAL' | 'DEGRADED_PERFORMANCE' | 'PARTIAL_OUTAGE' | 'MAJOR_OUTAGE' | 'UNDER_MAINTENANCE';

export interface CheckResult {
  status: CheckStatus;
  responseTime: number;
  statusCode?: number;
  error?: string;
  region: string;
  metadata?: Record<string, any>;
}

export interface UptimeBar {
  date: string;
  uptimePercent: number;
  totalChecks: number;
  downChecks: number;
}

export interface MonitorRecord {
  id: string;
  name: string;
  type: MonitorType;
  target: string;
  interval: number;
  timeout: number;
  regions: string[];
  expectedStatus: number | null;
  method: string | null;
  headers: any;
  body: string | null;
  keyword: string | null;
  keywordType: KeywordType | null;
  paused: boolean;
  sslExpiryThreshold: number | null;
  heartbeatToken: string | null;
  heartbeatGrace: number | null;
  alertAfter: number;
  recoveryAfter: number;
  orgId: string;
  componentId: string | null;
  currentStatus: string;
  lastCheckedAt: Date | null;
  uptimeDay: number | null;
  uptimeWeek: number | null;
  uptimeMonth: number | null;
  avgResponseTime: number | null;
  createdAt: Date;
}
