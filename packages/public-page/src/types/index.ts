export type ComponentStatus =
  | 'operational'
  | 'degraded_performance'
  | 'partial_outage'
  | 'major_outage'
  | 'under_maintenance';

export interface StatusComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  description?: string;
  group?: string;
  order?: number;
}

export interface ComponentGroup {
  name: string;
  components: StatusComponent[];
}

export interface UptimeDay {
  date: string;
  uptimePercent: number;
  status: 'operational' | 'degraded' | 'outage' | 'no_data';
}

export interface ComponentUptime {
  componentId: string;
  componentName: string;
  days: UptimeDay[];
  overallUptime: number;
}

export interface IncidentUpdate {
  id: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  message: string;
  createdAt: string;
}

export interface Incident {
  id: string;
  title: string;
  impact: 'none' | 'minor' | 'major' | 'critical';
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved' | 'postmortem';
  components: string[];
  updates: IncidentUpdate[];
  createdAt: string;
  resolvedAt?: string;
}

export interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  components: string[];
  status: 'scheduled' | 'in_progress' | 'completed';
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface ComponentMetrics {
  componentId: string;
  componentName: string;
  points: MetricPoint[];
}

export interface StatusPageData {
  name: string;
  logo?: string;
  components: StatusComponent[];
  uptime: ComponentUptime[];
  incidents: Incident[];
  maintenance: MaintenanceWindow[];
  metrics?: ComponentMetrics[];
}

export type OverallStatus = 'operational' | 'partial' | 'major';
