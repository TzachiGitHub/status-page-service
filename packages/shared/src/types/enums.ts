export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum MonitorType {
  HTTP = 'HTTP',
  TCP = 'TCP',
  PING = 'PING',
  SSL = 'SSL',
  HEARTBEAT = 'HEARTBEAT',
  DNS = 'DNS',
}

export enum MonitorStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
  PAUSED = 'PAUSED',
  PENDING = 'PENDING',
}

export enum CheckStatus {
  UP = 'UP',
  DOWN = 'DOWN',
  DEGRADED = 'DEGRADED',
}

export enum ComponentStatus {
  OPERATIONAL = 'OPERATIONAL',
  DEGRADED_PERFORMANCE = 'DEGRADED_PERFORMANCE',
  PARTIAL_OUTAGE = 'PARTIAL_OUTAGE',
  MAJOR_OUTAGE = 'MAJOR_OUTAGE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
}

export enum IncidentStatus {
  INVESTIGATING = 'INVESTIGATING',
  IDENTIFIED = 'IDENTIFIED',
  MONITORING = 'MONITORING',
  RESOLVED = 'RESOLVED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export enum IncidentImpact {
  NONE = 'NONE',
  MINOR = 'MINOR',
  MAJOR = 'MAJOR',
  CRITICAL = 'CRITICAL',
  MAINTENANCE = 'MAINTENANCE',
}

export enum AlertType {
  DOWN = 'DOWN',
  RECOVERY = 'RECOVERY',
  SSL_EXPIRY = 'SSL_EXPIRY',
  DEGRADED = 'DEGRADED',
}

export enum ChannelType {
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  SLACK = 'SLACK',
}

export enum KeywordType {
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
}
