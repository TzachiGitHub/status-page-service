export declare enum Role {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare enum MonitorType {
    HTTP = "HTTP",
    TCP = "TCP",
    PING = "PING",
    SSL = "SSL",
    HEARTBEAT = "HEARTBEAT",
    DNS = "DNS"
}
export declare enum MonitorStatus {
    UP = "UP",
    DOWN = "DOWN",
    DEGRADED = "DEGRADED",
    PAUSED = "PAUSED",
    PENDING = "PENDING"
}
export declare enum CheckStatus {
    UP = "UP",
    DOWN = "DOWN",
    DEGRADED = "DEGRADED"
}
export declare enum ComponentStatus {
    OPERATIONAL = "OPERATIONAL",
    DEGRADED_PERFORMANCE = "DEGRADED_PERFORMANCE",
    PARTIAL_OUTAGE = "PARTIAL_OUTAGE",
    MAJOR_OUTAGE = "MAJOR_OUTAGE",
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
}
export declare enum IncidentStatus {
    INVESTIGATING = "INVESTIGATING",
    IDENTIFIED = "IDENTIFIED",
    MONITORING = "MONITORING",
    RESOLVED = "RESOLVED",
    SCHEDULED = "SCHEDULED",
    IN_PROGRESS = "IN_PROGRESS"
}
export declare enum IncidentImpact {
    NONE = "NONE",
    MINOR = "MINOR",
    MAJOR = "MAJOR",
    CRITICAL = "CRITICAL",
    MAINTENANCE = "MAINTENANCE"
}
export declare enum AlertType {
    DOWN = "DOWN",
    RECOVERY = "RECOVERY",
    SSL_EXPIRY = "SSL_EXPIRY",
    DEGRADED = "DEGRADED"
}
export declare enum ChannelType {
    EMAIL = "EMAIL",
    WEBHOOK = "WEBHOOK",
    SLACK = "SLACK"
}
export declare enum KeywordType {
    CONTAINS = "CONTAINS",
    NOT_CONTAINS = "NOT_CONTAINS"
}
//# sourceMappingURL=enums.d.ts.map