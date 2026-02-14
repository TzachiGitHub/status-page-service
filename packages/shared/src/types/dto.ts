import {
  MonitorType,
  IncidentStatus,
  IncidentImpact,
  ComponentStatus,
  ChannelType,
  KeywordType,
} from './enums.js';

// ── Auth ──

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// ── Monitor ──

export interface CreateMonitorDto {
  name: string;
  type: MonitorType;
  url?: string;
  interval?: number;
  timeout?: number;
  retries?: number;
  regions?: string[];
  httpConfig?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
    expectedStatusCodes?: number[];
    keyword?: string;
    keywordType?: KeywordType;
    followRedirects?: boolean;
  };
  tcpConfig?: {
    host: string;
    port: number;
  };
  dnsConfig?: {
    host: string;
    recordType: string;
    expectedValue?: string;
    nameserver?: string;
  };
}

export interface UpdateMonitorDto extends Partial<CreateMonitorDto> {
  paused?: boolean;
}

// ── Component ──

export interface CreateComponentDto {
  name: string;
  description?: string;
  status?: ComponentStatus;
  groupId?: string;
  monitorId?: string;
  order?: number;
}

export interface UpdateComponentDto extends Partial<CreateComponentDto> {}

export interface CreateComponentGroupDto {
  name: string;
  order?: number;
}

// ── Incident ──

export interface CreateIncidentDto {
  title: string;
  status?: IncidentStatus;
  impact?: IncidentImpact;
  body: string;
  componentIds?: string[];
  componentStatus?: ComponentStatus;
  scheduledStartAt?: string;
  scheduledEndAt?: string;
}

export interface UpdateIncidentDto {
  title?: string;
  status?: IncidentStatus;
  impact?: IncidentImpact;
}

export interface AddIncidentUpdateDto {
  status: IncidentStatus;
  body: string;
  componentStatus?: ComponentStatus;
}

// ── Subscriber ──

export interface SubscribeDto {
  email: string;
  componentIds?: string[];
}

// ── Notification Channel ──

export interface CreateNotificationChannelDto {
  name: string;
  type: ChannelType;
  config: Record<string, unknown>;
  enabled?: boolean;
}

export interface UpdateNotificationChannelDto extends Partial<CreateNotificationChannelDto> {}

// ── Status Page ──

export interface UpdateStatusPageConfigDto {
  title?: string;
  description?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customDomain?: string;
  customCss?: string;
  showSubscribe?: boolean;
  showIncidentHistory?: boolean;
  historyDays?: number;
}

// ── API Key ──

export interface CreateApiKeyDto {
  name: string;
  expiresAt?: string;
}

export interface ApiKeyCreatedResponse {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  expiresAt?: string;
  createdAt: string;
}

// ── Generic ──

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
