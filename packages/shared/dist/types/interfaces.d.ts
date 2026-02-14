import { Role, MonitorType, MonitorStatus, CheckStatus, ComponentStatus, IncidentStatus, IncidentImpact, AlertType, ChannelType, KeywordType } from './enums.js';
export interface BaseEntity {
    id: string;
    createdAt: string;
    updatedAt: string;
}
export interface Organization extends BaseEntity {
    name: string;
    slug: string;
}
export interface Member extends BaseEntity {
    userId: string;
    organizationId: string;
    role: Role;
    email: string;
    name?: string;
}
export interface MonitorHttpConfig {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: string;
    expectedStatusCodes?: number[];
    keyword?: string;
    keywordType?: KeywordType;
    followRedirects?: boolean;
    timeout?: number;
}
export interface MonitorTcpConfig {
    host: string;
    port: number;
    timeout?: number;
}
export interface MonitorDnsConfig {
    host: string;
    recordType: string;
    expectedValue?: string;
    nameserver?: string;
}
export interface Monitor extends BaseEntity {
    organizationId: string;
    name: string;
    type: MonitorType;
    status: MonitorStatus;
    url?: string;
    interval: number;
    timeout: number;
    retries: number;
    httpConfig?: MonitorHttpConfig;
    tcpConfig?: MonitorTcpConfig;
    dnsConfig?: MonitorDnsConfig;
    regions: string[];
    paused: boolean;
    lastCheckedAt?: string;
    nextCheckAt?: string;
}
export interface MonitorCheck extends BaseEntity {
    monitorId: string;
    status: CheckStatus;
    responseTime: number;
    statusCode?: number;
    region: string;
    message?: string;
    checkedAt: string;
}
export interface Component extends BaseEntity {
    organizationId: string;
    name: string;
    description?: string;
    status: ComponentStatus;
    order: number;
    groupId?: string;
    monitorId?: string;
}
export interface ComponentGroup extends BaseEntity {
    organizationId: string;
    name: string;
    order: number;
}
export interface Incident extends BaseEntity {
    organizationId: string;
    title: string;
    status: IncidentStatus;
    impact: IncidentImpact;
    resolvedAt?: string;
    scheduledStartAt?: string;
    scheduledEndAt?: string;
}
export interface IncidentUpdate extends BaseEntity {
    incidentId: string;
    status: IncidentStatus;
    body: string;
    createdBy?: string;
}
export interface IncidentComponent {
    incidentId: string;
    componentId: string;
    status: ComponentStatus;
}
export interface Subscriber extends BaseEntity {
    organizationId: string;
    email: string;
    verified: boolean;
    verificationToken?: string;
    componentIds?: string[];
}
export interface Alert extends BaseEntity {
    monitorId: string;
    type: AlertType;
    message: string;
    acknowledgedAt?: string;
}
export interface NotificationChannel extends BaseEntity {
    organizationId: string;
    name: string;
    type: ChannelType;
    config: Record<string, unknown>;
    enabled: boolean;
}
export interface ApiKey extends BaseEntity {
    organizationId: string;
    name: string;
    keyHash: string;
    keyPrefix: string;
    lastUsedAt?: string;
    expiresAt?: string;
}
export interface StatusPageConfig extends BaseEntity {
    organizationId: string;
    slug: string;
    title: string;
    description?: string;
    logoUrl?: string;
    faviconUrl?: string;
    customDomain?: string;
    customCss?: string;
    showSubscribe: boolean;
    showIncidentHistory: boolean;
    historyDays: number;
}
export interface UptimeBar {
    date: string;
    upCount: number;
    totalCount: number;
    uptime: number;
}
//# sourceMappingURL=interfaces.d.ts.map