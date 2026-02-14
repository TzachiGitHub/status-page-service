export var Role;
(function (Role) {
    Role["OWNER"] = "OWNER";
    Role["ADMIN"] = "ADMIN";
    Role["MEMBER"] = "MEMBER";
})(Role || (Role = {}));
export var MonitorType;
(function (MonitorType) {
    MonitorType["HTTP"] = "HTTP";
    MonitorType["TCP"] = "TCP";
    MonitorType["PING"] = "PING";
    MonitorType["SSL"] = "SSL";
    MonitorType["HEARTBEAT"] = "HEARTBEAT";
    MonitorType["DNS"] = "DNS";
})(MonitorType || (MonitorType = {}));
export var MonitorStatus;
(function (MonitorStatus) {
    MonitorStatus["UP"] = "UP";
    MonitorStatus["DOWN"] = "DOWN";
    MonitorStatus["DEGRADED"] = "DEGRADED";
    MonitorStatus["PAUSED"] = "PAUSED";
    MonitorStatus["PENDING"] = "PENDING";
})(MonitorStatus || (MonitorStatus = {}));
export var CheckStatus;
(function (CheckStatus) {
    CheckStatus["UP"] = "UP";
    CheckStatus["DOWN"] = "DOWN";
    CheckStatus["DEGRADED"] = "DEGRADED";
})(CheckStatus || (CheckStatus = {}));
export var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["OPERATIONAL"] = "OPERATIONAL";
    ComponentStatus["DEGRADED_PERFORMANCE"] = "DEGRADED_PERFORMANCE";
    ComponentStatus["PARTIAL_OUTAGE"] = "PARTIAL_OUTAGE";
    ComponentStatus["MAJOR_OUTAGE"] = "MAJOR_OUTAGE";
    ComponentStatus["UNDER_MAINTENANCE"] = "UNDER_MAINTENANCE";
})(ComponentStatus || (ComponentStatus = {}));
export var IncidentStatus;
(function (IncidentStatus) {
    IncidentStatus["INVESTIGATING"] = "INVESTIGATING";
    IncidentStatus["IDENTIFIED"] = "IDENTIFIED";
    IncidentStatus["MONITORING"] = "MONITORING";
    IncidentStatus["RESOLVED"] = "RESOLVED";
    IncidentStatus["SCHEDULED"] = "SCHEDULED";
    IncidentStatus["IN_PROGRESS"] = "IN_PROGRESS";
})(IncidentStatus || (IncidentStatus = {}));
export var IncidentImpact;
(function (IncidentImpact) {
    IncidentImpact["NONE"] = "NONE";
    IncidentImpact["MINOR"] = "MINOR";
    IncidentImpact["MAJOR"] = "MAJOR";
    IncidentImpact["CRITICAL"] = "CRITICAL";
    IncidentImpact["MAINTENANCE"] = "MAINTENANCE";
})(IncidentImpact || (IncidentImpact = {}));
export var AlertType;
(function (AlertType) {
    AlertType["DOWN"] = "DOWN";
    AlertType["RECOVERY"] = "RECOVERY";
    AlertType["SSL_EXPIRY"] = "SSL_EXPIRY";
    AlertType["DEGRADED"] = "DEGRADED";
})(AlertType || (AlertType = {}));
export var ChannelType;
(function (ChannelType) {
    ChannelType["EMAIL"] = "EMAIL";
    ChannelType["WEBHOOK"] = "WEBHOOK";
    ChannelType["SLACK"] = "SLACK";
})(ChannelType || (ChannelType = {}));
export var KeywordType;
(function (KeywordType) {
    KeywordType["CONTAINS"] = "CONTAINS";
    KeywordType["NOT_CONTAINS"] = "NOT_CONTAINS";
})(KeywordType || (KeywordType = {}));
//# sourceMappingURL=enums.js.map