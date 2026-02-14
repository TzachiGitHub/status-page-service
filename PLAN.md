# 🟢 Status Page & Uptime Monitor — Full SaaS Clone
## Comprehensive Project Plan

---

## 1. Market Research: Top 3 Competitors

### 1.1 Atlassian Statuspage (statuspage.io)
- **Market position**: The OG. Acquired by Atlassian. Used by Dropbox, DigitalOcean, Twilio.
- **Pricing**: Free (100 subs, 2 members) → Hobby $29/mo → Startup $99/mo → Business $399/mo → Enterprise $1,499/mo
- **Core features**:
  - Public, private, and audience-specific status pages
  - Component-based status (operational/degraded/partial outage/major outage)
  - Incident management with updates timeline
  - Scheduled maintenance windows
  - Subscriber notifications (email, SMS, webhook, Slack, MS Teams)
  - Component subscriptions (subscribe to specific services)
  - Custom domain (CNAME)
  - Custom CSS/HTML/JS
  - Uptime metrics & historical uptime display
  - 150+ third-party component integrations (Stripe, PagerDuty, etc.)
  - Incident templates
  - REST API
  - Role-based access control
  - SSO (via Atlassian Guard)
- **Strengths**: Brand trust (Atlassian), deep Jira/Opsgenie integration, mature
- **Weaknesses**: Expensive at scale, dated UI, no built-in uptime monitoring (just status communication), slow to innovate, requires separate monitoring tool

### 1.2 Better Stack (betterstack.com)
- **Market position**: Fast-growing challenger. Combines uptime monitoring + status page + incident management + logging in one platform.
- **Pricing**: Free (10 monitors, 10 heartbeats, status page, 3-min checks) → Team ~$85/mo → Business ~$269/mo
- **Core features**:
  - **Uptime monitoring**: HTTP/HTTPS, API, ping, SSL, domain expiration, POP3, IMAP, SMTP, DNS, TCP/UDP
  - 30-second check intervals (fastest tier)
  - Multi-region monitoring (checks from worldwide locations)
  - Screenshot on error + error logs
  - Traceroute & MTR for timeout debugging
  - Cron job / heartbeat monitoring
  - **Status page**: Branded, custom domain, dark mode, interactive charts
  - Custom CSS, subscriber management, component-level subscriptions
  - Translated into any language
  - Embedded response time charts + custom metrics
  - **Incident management**: Smart incident merging, on-call schedules, escalation policies
  - Integrations: Datadog, New Relic, Grafana, Prometheus, Zabbix, AWS, GCP, Azure, Slack, PagerDuty
  - SOC 2 Type 2 compliant, GDPR compliant
- **Strengths**: All-in-one (monitoring + status + incidents), beautiful modern UI, generous free tier, fast-growing
- **Weaknesses**: Newer/less enterprise trust, no HIPAA, less integration depth than Atlassian ecosystem

### 1.3 Instatus (instatus.com)
- **Market position**: Lightweight, developer-friendly. Focuses on simplicity and speed.
- **Pricing**: Free (15 monitors, 2-min checks, 5 members, 200 subs) → Pro $20/mo → Business $300/mo → Enterprise custom
- **Core features**:
  - Uptime monitoring (15-1000 monitors, 30s-2min checks)
  - Status page (public + private)
  - Email, SMS, and phone call alerts
  - On-call scheduling
  - Slack & Teams integration
  - Custom domain
  - Subscriber management
  - SAML SSO (Business+)
  - Incident management with team collaboration
  - SCIM directory sync (Enterprise)
- **Strengths**: Simple, affordable, fast setup (30 seconds), generous free tier
- **Weaknesses**: Fewer integrations, less customization, smaller team/community

---

## 2. Feature Matrix

| Feature | Statuspage | BetterStack | Instatus | **Ours** |
|---------|-----------|-------------|----------|----------|
| **Status Page** | ✅ | ✅ | ✅ | ✅ P0 |
| Custom domain (CNAME) | ✅ | ✅ | ✅ | ✅ P0 |
| Component-based status | ✅ | ✅ | ✅ | ✅ P0 |
| Component groups | ✅ | ✅ | ❌ | ✅ P0 |
| Incident management | ✅ | ✅ | ✅ | ✅ P0 |
| Incident updates timeline | ✅ | ✅ | ✅ | ✅ P0 |
| Incident templates | ✅ | ✅ | ❌ | ✅ P1 |
| Scheduled maintenance | ✅ | ✅ | ✅ | ✅ P0 |
| Subscriber notifications (email) | ✅ | ✅ | ✅ | ✅ P0 |
| Subscriber notifications (webhook) | ✅ | ✅ | ❌ | ✅ P1 |
| Component subscriptions | ✅ | ✅ | ❌ | ✅ P1 |
| **Uptime Monitoring** | ❌ | ✅ | ✅ | ✅ P0 |
| HTTP/HTTPS checks | ❌ | ✅ | ✅ | ✅ P0 |
| TCP/Ping checks | ❌ | ✅ | ❌ | ✅ P1 |
| SSL certificate monitoring | ❌ | ✅ | ❌ | ✅ P1 |
| Domain expiration monitoring | ❌ | ✅ | ❌ | ✅ P2 |
| Cron/heartbeat monitoring | ❌ | ✅ | ❌ | ✅ P1 |
| Multi-region checks | ❌ | ✅ | ✅ | ✅ P0 |
| Check intervals (30s-5min) | ❌ | ✅ (30s) | ✅ (30s) | ✅ P0 |
| Response time charts | ❌ | ✅ | ❌ | ✅ P0 |
| Screenshot on error | ❌ | ✅ | ❌ | ❌ P3 |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ P0 |
| Historical uptime % | ✅ | ✅ | ✅ | ✅ P0 |
| Custom metrics | ✅ | ✅ | ❌ | ✅ P1 |
| Dark mode | ❌ | ✅ | ❌ | ✅ P0 |
| Custom CSS/branding | ✅ | ✅ | ❌ | ✅ P1 |
| REST API | ✅ | ✅ | ❌ | ✅ P0 |
| Role-based access | ✅ | ❌ | ❌ | ✅ P2 |
| SSO | ✅ | ❌ | ✅ | ❌ P3 |
| **Alerting** | ❌ | ✅ | ✅ | ✅ P0 |
| Email alerts | ❌ | ✅ | ✅ | ✅ P0 |
| Webhook alerts | ✅ | ✅ | ❌ | ✅ P0 |
| Slack integration | ✅ | ✅ | ✅ | ✅ P1 |
| On-call scheduling | ❌ | ✅ | ✅ | ✅ P2 |
| Escalation policies | ❌ | ✅ | ❌ | ❌ P3 |
| **Incident Management** | ✅ | ✅ | ✅ | ✅ P0 |
| Incident merging | ❌ | ✅ | ❌ | ✅ P2 |
| Post-mortems | ❌ | ✅ | ❌ | ✅ P2 |
| **Our Edge (P3)** | | | | |
| Open-source / self-hosted | ❌ | ❌ | ❌ | ✅ |
| Built-in learn page (educational) | ❌ | ❌ | ❌ | ✅ |
| Tooltips on every term | ❌ | ❌ | ❌ | ✅ |
| Real-time SSE streaming | ❌ | ❌ | ❌ | ✅ |
| i18n / multi-language | partial | ✅ | ❌ | ✅ |

---

## 3. Vision & Goals

Build a **production-grade, self-hosted Status Page & Uptime Monitoring platform** that combines the best of Statuspage, BetterStack, and Instatus:
- **Beautiful branded status pages** with custom domains, components, dark mode
- **Built-in uptime monitoring** (HTTP, TCP, ping, SSL, heartbeat) — the key differentiator vs Statuspage
- **Incident management** with timeline, templates, scheduled maintenance
- **Subscriber notifications** (email, webhook, component-level subscriptions)
- **Real-time dashboard** with uptime %, response time charts, alerting
- **REST API** for programmatic access
- **Educational**: Every concept gets tooltips + a comprehensive Learn page

---

## 4. Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Language** | TypeScript (strict mode) everywhere | Type safety, shared types |
| **Frontend** | React 18 + Vite + Tailwind CSS | Fast dev, great DX |
| **Backend API** | Node.js + Express | Simple, SSE-friendly |
| **Database** | PostgreSQL (via Prisma ORM) | JSONB for flexible configs, transactions |
| **Real-time** | Server-Sent Events (SSE) | Server→client streaming for live status |
| **Monitoring Worker** | Node.js worker threads / setInterval | Runs uptime checks on schedule |
| **Email** | Nodemailer (or Resend API) | Subscriber & alert notifications |
| **Auth** | JWT tokens + API keys | Dashboard users get JWT; API consumers get API keys |
| **Testing** | Vitest + Supertest | Unit + API tests |
| **Containerization** | Docker + Docker Compose | One command to run everything |
| **Monorepo** | npm workspaces | Shared types between packages |

### Package Structure
```
status-page-service/
├── packages/
│   ├── shared/                  # Shared TypeScript types & utilities
│   │   └── src/
│   │       ├── types/           # Monitor, Component, Incident, Subscriber types
│   │       ├── constants/       # Status enums, check types, intervals
│   │       └── utils/           # Shared helpers
│   ├── server/                  # Backend API + monitoring worker
│   │   └── src/
│   │       ├── routes/          # REST API routes
│   │       ├── services/        # Business logic
│   │       ├── middleware/       # Auth, validation, rate limiting
│   │       ├── sse/             # SSE streaming manager
│   │       ├── monitor/         # Uptime check workers
│   │       │   ├── checks/      # HTTP, TCP, Ping, SSL, Heartbeat checkers
│   │       │   ├── scheduler.ts # Check scheduling engine
│   │       │   └── alerter.ts   # Alert evaluation & dispatch
│   │       ├── notifications/   # Email, webhook, Slack dispatchers
│   │       ├── prisma/          # Database schema & migrations
│   │       └── workers/         # Background jobs
│   ├── dashboard/               # React admin dashboard
│   │   └── src/
│   │       ├── components/      # UI components
│   │       ├── pages/           # Route pages
│   │       ├── hooks/           # Custom hooks
│   │       ├── stores/          # State management (Zustand)
│   │       └── api/             # API client
│   ├── public-page/             # Public status page (embeddable React app)
│   │   └── src/
│   │       ├── components/      # Status page UI
│   │       └── themes/          # Light/dark/custom themes
│   └── widget/                  # Embeddable status badge/widget
│       └── src/
│           └── badge.ts         # Lightweight embed script
├── test-app/                    # Demo app that showcases everything
├── docker-compose.yml
└── package.json
```

---

## 5. Data Model

### Core Entities

```prisma
model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique    // org-slug.statuspage.dev
  logo        String?
  favicon     String?
  customDomain String?
  customCss   String?
  theme       Json     @default("{}")  // colors, fonts
  timezone    String   @default("UTC")
  createdAt   DateTime @default(now())
  
  members     Member[]
  monitors    Monitor[]
  components  Component[]
  componentGroups ComponentGroup[]
  incidents   Incident[]
  subscribers Subscriber[]
  apiKeys     ApiKey[]
  notificationChannels NotificationChannel[]
  statusPageConfig StatusPageConfig?
}

model Member {
  id        String   @id @default(uuid())
  email     String
  name      String
  password  String   // hashed
  role      Role     @default(MEMBER) // OWNER, ADMIN, MEMBER
  orgId     String
  org       Organization @relation(fields: [orgId], references: [id])
  createdAt DateTime @default(now())
  
  @@unique([email, orgId])
}

model Monitor {
  id              String       @id @default(uuid())
  name            String
  type            MonitorType  // HTTP, TCP, PING, SSL, HEARTBEAT, DNS
  target          String       // URL, IP, hostname
  interval        Int          @default(300) // seconds (60, 120, 300, etc.)
  timeout         Int          @default(30)  // seconds
  regions         String[]     @default(["us-east"])  // check from these regions
  expectedStatus  Int?         @default(200) // for HTTP
  method          String?      @default("GET") // for HTTP
  headers         Json?        // custom headers for HTTP
  body            String?      // request body for HTTP
  keyword         String?      // check response contains keyword
  keywordType     KeywordType? // CONTAINS, NOT_CONTAINS
  paused          Boolean      @default(false)
  
  // SSL-specific
  sslExpiryThreshold Int?     @default(30) // days before expiry to alert
  
  // Heartbeat-specific
  heartbeatToken  String?      @unique // unique token for heartbeat endpoint
  heartbeatGrace  Int?         @default(300) // grace period in seconds
  
  // Alert config
  alertAfter      Int          @default(1)  // alert after N consecutive failures
  recoveryAfter   Int          @default(1)  // recover after N consecutive successes
  
  // Relations
  orgId           String
  org             Organization @relation(fields: [orgId], references: [id])
  componentId     String?      // linked component (auto-update status)
  component       Component?   @relation(fields: [componentId], references: [id])
  checks          MonitorCheck[]
  alerts          Alert[]
  
  currentStatus   MonitorStatus @default(UP) // UP, DOWN, DEGRADED, PAUSED
  lastCheckedAt   DateTime?
  uptimeDay       Float?       // cached uptime % last 24h
  uptimeWeek      Float?       // cached uptime % last 7d
  uptimeMonth     Float?       // cached uptime % last 30d
  avgResponseTime Float?       // cached avg response time
  
  createdAt       DateTime     @default(now())
}

model MonitorCheck {
  id           String   @id @default(uuid())
  monitorId    String
  monitor      Monitor  @relation(fields: [monitorId], references: [id], onDelete: Cascade)
  status       CheckStatus // UP, DOWN, DEGRADED
  responseTime Int?     // ms
  statusCode   Int?     // HTTP status code
  region       String   // which region checked
  error        String?  // error message if failed
  checkedAt    DateTime @default(now())
  
  @@index([monitorId, checkedAt])
}

model Component {
  id          String          @id @default(uuid())
  name        String
  description String?
  status      ComponentStatus @default(OPERATIONAL)
  position    Int             @default(0)
  showUptime  Boolean         @default(true)
  
  groupId     String?
  group       ComponentGroup? @relation(fields: [groupId], references: [id])
  orgId       String
  org         Organization    @relation(fields: [orgId], references: [id])
  monitors    Monitor[]
  
  createdAt   DateTime        @default(now())
}

model ComponentGroup {
  id         String      @id @default(uuid())
  name       String
  position   Int         @default(0)
  collapsed  Boolean     @default(false) // collapsed by default on public page
  
  orgId      String
  org        Organization @relation(fields: [orgId], references: [id])
  components Component[]
  
  createdAt  DateTime    @default(now())
}

model Incident {
  id              String          @id @default(uuid())
  title           String
  status          IncidentStatus  // INVESTIGATING, IDENTIFIED, MONITORING, RESOLVED
  impact          IncidentImpact  // NONE, MINOR, MAJOR, CRITICAL
  scheduledAt     DateTime?       // for scheduled maintenance
  scheduledUntil  DateTime?
  resolvedAt      DateTime?
  
  orgId           String
  org             Organization    @relation(fields: [orgId], references: [id])
  components      IncidentComponent[]
  updates         IncidentUpdate[]
  
  createdAt       DateTime        @default(now())
}

model IncidentUpdate {
  id         String         @id @default(uuid())
  body       String         // markdown
  status     IncidentStatus
  
  incidentId String
  incident   Incident       @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  createdBy  String?        // member id
  
  createdAt  DateTime       @default(now())
}

model IncidentComponent {
  id          String          @id @default(uuid())
  incidentId  String
  incident    Incident        @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  componentId String
  status      ComponentStatus // status during this incident
  
  @@unique([incidentId, componentId])
}

model Subscriber {
  id              String   @id @default(uuid())
  email           String
  phone           String?
  webhookUrl      String?
  confirmed       Boolean  @default(false)
  confirmToken    String?  @unique
  unsubscribeToken String  @unique @default(uuid())
  
  // Component-level subscriptions (empty = all)
  componentIds    String[] @default([])
  
  orgId           String
  org             Organization @relation(fields: [orgId], references: [id])
  
  createdAt       DateTime @default(now())
  
  @@unique([email, orgId])
}

model Alert {
  id         String      @id @default(uuid())
  monitorId  String
  monitor    Monitor     @relation(fields: [monitorId], references: [id])
  type       AlertType   // DOWN, RECOVERY, SSL_EXPIRY, DEGRADED
  message    String
  notified   Boolean     @default(false)
  
  startedAt  DateTime    @default(now())
  resolvedAt DateTime?
}

model NotificationChannel {
  id     String          @id @default(uuid())
  type   ChannelType     // EMAIL, WEBHOOK, SLACK
  config Json            // { url, token, channel, etc. }
  name   String
  
  orgId  String
  org    Organization    @relation(fields: [orgId], references: [id])
  
  createdAt DateTime     @default(now())
}

model ApiKey {
  id     String   @id @default(uuid())
  key    String   @unique @default(uuid())
  name   String
  scopes String[] @default(["read"])
  
  orgId  String
  org    Organization @relation(fields: [orgId], references: [id])
  
  lastUsedAt DateTime?
  createdAt  DateTime  @default(now())
}

model StatusPageConfig {
  id                String  @id @default(uuid())
  orgId             String  @unique
  org               Organization @relation(fields: [orgId], references: [id])
  
  title             String?
  description       String?
  showSubscribe     Boolean @default(true)
  showUptime        Boolean @default(true)
  showResponseTime  Boolean @default(true)
  showIncidentHistory Boolean @default(true)
  historyDays       Int     @default(90)
  darkMode          Boolean @default(false)
  headerBg          String? // custom color
  headerText        String? // custom color
  language          String  @default("en")
}

// Enums
enum Role { OWNER ADMIN MEMBER }
enum MonitorType { HTTP TCP PING SSL HEARTBEAT DNS }
enum MonitorStatus { UP DOWN DEGRADED PAUSED PENDING }
enum CheckStatus { UP DOWN DEGRADED }
enum ComponentStatus { OPERATIONAL DEGRADED_PERFORMANCE PARTIAL_OUTAGE MAJOR_OUTAGE UNDER_MAINTENANCE }
enum IncidentStatus { INVESTIGATING IDENTIFIED MONITORING RESOLVED SCHEDULED IN_PROGRESS }
enum IncidentImpact { NONE MINOR MAJOR CRITICAL MAINTENANCE }
enum AlertType { DOWN RECOVERY SSL_EXPIRY DEGRADED }
enum ChannelType { EMAIL WEBHOOK SLACK }
enum KeywordType { CONTAINS NOT_CONTAINS }
```

---

## 6. API Design

### Authentication
- **Dashboard**: JWT token (login → get token → send in `Authorization: Bearer <token>`)
- **Public API**: API key in `Authorization: ApiKey <key>` header
- **Public page**: No auth needed (public endpoints)
- **Heartbeat**: POST to `/api/heartbeat/<token>` (monitor-specific token)

### Endpoints

#### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create org + first user |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user info |

#### Monitors (Auth: JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/monitors` | List all monitors |
| POST | `/api/monitors` | Create monitor |
| GET | `/api/monitors/:id` | Get monitor details |
| PATCH | `/api/monitors/:id` | Update monitor |
| DELETE | `/api/monitors/:id` | Delete monitor |
| POST | `/api/monitors/:id/pause` | Pause monitor |
| POST | `/api/monitors/:id/resume` | Resume monitor |
| GET | `/api/monitors/:id/checks` | Get check history |
| GET | `/api/monitors/:id/uptime` | Get uptime stats |
| GET | `/api/monitors/:id/response-times` | Get response time data |

#### Heartbeats (No auth — token in URL)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/heartbeat/:token` | Send heartbeat ping |
| GET | `/api/heartbeat/:token` | Send heartbeat ping (GET support) |

#### Components (Auth: JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/components` | List all components |
| POST | `/api/components` | Create component |
| PATCH | `/api/components/:id` | Update component (including status) |
| DELETE | `/api/components/:id` | Delete component |
| POST | `/api/components/reorder` | Reorder components |

#### Component Groups (Auth: JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/component-groups` | List groups |
| POST | `/api/component-groups` | Create group |
| PATCH | `/api/component-groups/:id` | Update group |
| DELETE | `/api/component-groups/:id` | Delete group |

#### Incidents (Auth: JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/incidents` | List incidents |
| POST | `/api/incidents` | Create incident |
| GET | `/api/incidents/:id` | Get incident with updates |
| PATCH | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete incident |
| POST | `/api/incidents/:id/updates` | Add incident update |

#### Subscribers (Auth: JWT for management, public for subscribe)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/subscribers` | List subscribers (admin) |
| POST | `/api/subscribe` | Public subscribe (email confirmation) |
| GET | `/api/subscribe/confirm/:token` | Confirm subscription |
| GET | `/api/unsubscribe/:token` | Unsubscribe |
| DELETE | `/api/subscribers/:id` | Remove subscriber (admin) |

#### Notification Channels (Auth: JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/notification-channels` | List channels |
| POST | `/api/notification-channels` | Create channel |
| POST | `/api/notification-channels/:id/test` | Test channel |
| DELETE | `/api/notification-channels/:id` | Delete channel |

#### Status Page Config (Auth: JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/status-page/config` | Get status page config |
| PATCH | `/api/status-page/config` | Update config |

#### Public Status Page API (No auth — org slug in path)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/public/:slug/status` | Overall status + components |
| GET | `/api/public/:slug/incidents` | Active + recent incidents |
| GET | `/api/public/:slug/incidents/:id` | Incident detail with updates |
| GET | `/api/public/:slug/uptime` | Component uptime data (90 days) |
| GET | `/api/public/:slug/metrics` | Response time metrics |

#### SSE Streaming
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/sse/dashboard` | Dashboard real-time updates (Auth: JWT) |
| GET | `/api/public/:slug/sse` | Public page real-time updates |

#### API Keys (Auth: JWT, OWNER/ADMIN only)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/api-keys` | List API keys |
| POST | `/api/api-keys` | Create API key |
| DELETE | `/api/api-keys/:id` | Revoke API key |

---

## 7. Monitoring Engine Architecture

### Check Types

1. **HTTP/HTTPS**: Send request, validate status code, check keyword, measure response time
2. **TCP**: Open socket connection, measure connect time
3. **Ping**: ICMP ping (or TCP fallback), measure latency
4. **SSL**: Connect via TLS, extract cert expiry date, alert if < threshold days
5. **Heartbeat**: Passive — expect POST/GET to heartbeat endpoint within grace period
6. **DNS**: Resolve hostname, validate expected IP/CNAME

### Scheduling
```
Scheduler (runs every 10s)
  → Query monitors due for check (lastCheckedAt + interval < now)
  → For each monitor:
      → Run check from configured region(s)
      → Record MonitorCheck result
      → Evaluate alert conditions:
          - If consecutive failures >= alertAfter → trigger DOWN alert
          - If consecutive successes >= recoveryAfter → trigger RECOVERY alert
      → Update Monitor.currentStatus, uptimeDay/Week/Month cache
      → If linked to Component → auto-update Component status
      → Send SSE update to connected clients
      → If alert triggered → dispatch notifications
```

### Alert Flow
```
Alert Triggered
  → Find org's notification channels
  → For each channel:
      - EMAIL: Send via Nodemailer/Resend
      - WEBHOOK: POST JSON payload to URL
      - SLACK: POST to Slack webhook URL
  → Record alert in database
  → If monitor linked to component → create/update incident automatically (optional)
```

---

## 8. Educational Features (Our Edge)

### Tooltips (60+ terms)
Every domain term gets a hover tooltip explaining it:
- Uptime, SLA, Nine-nines, MTTR, MTTD, MTBF
- HTTP status codes (200, 301, 403, 404, 500, 502, 503)
- SSL/TLS, Certificate Authority, Let's Encrypt
- DNS, CNAME, A record, TTL
- TCP, ICMP, Ping, Traceroute, MTR
- Heartbeat monitoring, Cron jobs
- Incident management, Postmortem, RCA (Root Cause Analysis)
- Status levels: Operational, Degraded, Partial Outage, Major Outage
- SRE, DevOps, On-call, Escalation policy, PagerDuty
- Webhook, SSE, Polling, WebSocket
- Component, Service, Dependency
- Subscriber, Notification channel
- API key, JWT, Bearer token
- Custom domain, CNAME record, Subdomain

### Learn Page Topics
1. What is a Status Page & Why You Need One
2. Uptime Monitoring 101: HTTP, TCP, Ping, SSL
3. SLA & the Nines (99.9% vs 99.99% vs 99.999%)
4. Incident Management Best Practices
5. Alerting Strategies: Don't Wake Up the Whole Team
6. Heartbeat Monitoring: Cron Jobs & Background Workers
7. SSL Certificates: How They Work & Why They Expire
8. DNS Monitoring: A Records, CNAMEs, and TTL
9. Building a Public Status Page: Transparency Builds Trust
10. Webhooks vs SSE vs WebSockets: Real-Time Communication

---

## 9. TODO List

### 9.1 Shared Package (`packages/shared/`)
- [ ] [P0][S] Create shared types: MonitorType, MonitorStatus, CheckStatus, ComponentStatus
- [ ] [P0][S] Create shared types: IncidentStatus, IncidentImpact, AlertType, ChannelType
- [ ] [P0][S] Create shared types: Organization, Member, Monitor, MonitorCheck
- [ ] [P0][S] Create shared types: Component, ComponentGroup, Incident, IncidentUpdate
- [ ] [P0][S] Create shared types: Subscriber, Alert, NotificationChannel, ApiKey
- [ ] [P0][S] Create shared types: StatusPageConfig, API request/response DTOs
- [ ] [P0][S] Create shared constants: status labels, colors, intervals, regions
- [ ] [P0][S] Create shared utils: date formatting, uptime calculation, slug generation
- [ ] [P0][S] Package.json, tsconfig, build script

### 9.2 Server - Database & Auth (`packages/server/`)
- [ ] [P0][M] Prisma schema with all models (from data model above)
- [ ] [P0][S] Prisma migrations setup
- [ ] [P0][S] Database seed script (demo org, monitors, components, incidents)
- [ ] [P0][M] Auth routes: POST /auth/register (create org + user)
- [ ] [P0][M] Auth routes: POST /auth/login (JWT generation)
- [ ] [P0][S] Auth routes: GET /auth/me
- [ ] [P0][M] Auth middleware (JWT verification, org context)
- [ ] [P0][S] API key middleware (for public API)
- [ ] [P0][S] Error handling middleware
- [ ] [P0][S] CORS configuration
- [ ] [P0][S] Request validation (zod schemas)

### 9.3 Server - Monitor CRUD (`packages/server/`)
- [ ] [P0][M] GET /monitors — list monitors with current status & uptime
- [ ] [P0][M] POST /monitors — create monitor (validate by type)
- [ ] [P0][M] GET /monitors/:id — monitor detail with recent checks
- [ ] [P0][M] PATCH /monitors/:id — update monitor config
- [ ] [P0][S] DELETE /monitors/:id — delete monitor + cascade checks
- [ ] [P0][S] POST /monitors/:id/pause — pause monitoring
- [ ] [P0][S] POST /monitors/:id/resume — resume monitoring
- [ ] [P0][M] GET /monitors/:id/checks — paginated check history
- [ ] [P0][M] GET /monitors/:id/uptime — uptime stats (24h, 7d, 30d, 90d)
- [ ] [P0][M] GET /monitors/:id/response-times — response time series data

### 9.4 Server - Monitoring Engine (`packages/server/`)
- [ ] [P0][L] HTTP checker: send request, validate status/keyword, measure time
- [ ] [P1][M] TCP checker: open socket, measure connect time
- [ ] [P1][M] Ping checker: TCP-based ping, measure latency
- [ ] [P1][M] SSL checker: TLS connect, extract cert expiry
- [ ] [P1][M] Heartbeat checker: validate last heartbeat within grace period
- [ ] [P0][L] Check scheduler: query due monitors, dispatch checks
- [ ] [P0][M] Result processor: record check, update monitor status
- [ ] [P0][M] Alert evaluator: consecutive failure/recovery logic
- [ ] [P0][M] Uptime cache updater: recalculate day/week/month averages
- [ ] [P0][M] Component auto-updater: update linked component status from monitor
- [ ] [P0][S] Heartbeat endpoint: POST/GET /heartbeat/:token

### 9.5 Server - Components (`packages/server/`)
- [ ] [P0][M] CRUD routes for components
- [ ] [P0][M] CRUD routes for component groups
- [ ] [P0][S] Reorder endpoint (position updates)
- [ ] [P0][S] Component status history (for uptime bars on public page)

### 9.6 Server - Incidents (`packages/server/`)
- [ ] [P0][M] CRUD routes for incidents
- [ ] [P0][M] Add incident update (with status change)
- [ ] [P0][S] Link components to incidents (affected components)
- [ ] [P0][M] Auto-create incident from monitor alert (configurable)
- [ ] [P1][M] Scheduled maintenance: create, start, complete
- [ ] [P1][S] Incident templates: CRUD + apply to new incident

### 9.7 Server - Subscribers & Notifications (`packages/server/`)
- [ ] [P0][M] Public subscribe endpoint (email confirmation flow)
- [ ] [P0][S] Confirm subscription endpoint
- [ ] [P0][S] Unsubscribe endpoint
- [ ] [P0][M] Subscriber management (admin list, delete)
- [ ] [P1][S] Component-level subscriptions
- [ ] [P0][M] Email notification dispatcher (Nodemailer)
- [ ] [P0][M] Webhook notification dispatcher
- [ ] [P1][M] Slack notification dispatcher
- [ ] [P0][S] Notification channel CRUD
- [ ] [P0][S] Test notification endpoint
- [ ] [P0][M] Incident notification: notify subscribers on incident create/update

### 9.8 Server - Public Status Page API (`packages/server/`)
- [ ] [P0][M] GET /public/:slug/status — overall status + components
- [ ] [P0][M] GET /public/:slug/incidents — active + recent incidents
- [ ] [P0][S] GET /public/:slug/incidents/:id — incident detail
- [ ] [P0][M] GET /public/:slug/uptime — 90-day uptime bars per component
- [ ] [P0][M] GET /public/:slug/metrics — response time charts data
- [ ] [P0][S] Status page config CRUD

### 9.9 Server - SSE & Real-time (`packages/server/`)
- [ ] [P0][M] SSE manager: connection tracking, org-scoped broadcasting
- [ ] [P0][S] Dashboard SSE endpoint (auth required)
- [ ] [P0][S] Public page SSE endpoint (org slug)
- [ ] [P0][S] Broadcast on: check result, status change, incident create/update, component change

### 9.10 Server - API Keys (`packages/server/`)
- [ ] [P0][M] API key CRUD (create, list, revoke)
- [ ] [P0][M] API key auth middleware
- [ ] [P0][S] Scope-based access control (read, write, admin)

### 9.11 Dashboard (`packages/dashboard/`)
- [ ] [P0][M] App shell: sidebar, header, routing, auth context
- [ ] [P0][M] Login page
- [ ] [P0][M] Register page (create org)
- [ ] [P0][L] **Monitors page**: list monitors with status badges, uptime %, sparkline charts
- [ ] [P0][L] **Monitor detail page**: status, uptime chart (30/60/90 days), response time chart, check log, alert history
- [ ] [P0][M] **Create/edit monitor form**: type selection, config by type, test button
- [ ] [P0][L] **Components page**: drag-and-drop reorder, groups, status toggles
- [ ] [P0][L] **Incidents page**: list, create, update timeline
- [ ] [P0][M] **Create incident form**: title, impact, affected components, initial update
- [ ] [P0][M] **Incident detail page**: update timeline, add update, resolve
- [ ] [P1][M] **Scheduled maintenance**: create, list, calendar view
- [ ] [P0][M] **Subscribers page**: list, export, delete
- [ ] [P0][M] **Notification channels page**: add email/webhook/Slack, test
- [ ] [P0][M] **Status page settings**: branding, custom domain instructions, toggle features
- [ ] [P0][S] **API keys page**: create, list, revoke
- [ ] [P1][M] **Overview/dashboard page**: summary cards (total monitors, up/down counts, active incidents), uptime overview
- [ ] [P0][S] Dark mode toggle (Tailwind dark class)
- [ ] [P0][S] Responsive layout (mobile-friendly)
- [ ] [P0][M] API client (axios with JWT interceptor)
- [ ] [P0][S] SSE connection hook (real-time updates)
- [ ] [P0][L] **Tooltips**: 60+ domain term tooltips throughout UI
- [ ] [P0][L] **Learn page**: 10 educational topics with interactive content

### 9.12 Public Status Page (`packages/public-page/`)
- [ ] [P0][L] **Status page layout**: header (logo, title), overall status banner
- [ ] [P0][L] **Component list**: grouped components with status indicators
- [ ] [P0][M] **Uptime bars**: 90-day uptime visualization per component (like BetterStack/Statuspage)
- [ ] [P0][M] **Active incidents**: current incidents with update timeline
- [ ] [P0][M] **Incident history**: past incidents (paginated)
- [ ] [P0][M] **Subscribe form**: email input + component selection
- [ ] [P0][S] **Response time charts**: embedded line charts
- [ ] [P0][M] **Dark mode**: auto-detect + toggle
- [ ] [P0][S] **SSE**: real-time status updates
- [ ] [P1][S] **Customizable theme**: colors from org config
- [ ] [P0][S] **Mobile responsive**

### 9.13 Test App (`test-app/`)
- [ ] [P0][M] Express app with 3 endpoints (healthy, slow, flaky)
- [ ] [P0][S] /health — always 200
- [ ] [P0][S] /slow — responds after 2-5s delay
- [ ] [P0][S] /flaky — randomly fails 30% of the time
- [ ] [P0][S] /crash — always 500
- [ ] [P0][M] Setup script: create monitors pointing to test app endpoints

### 9.14 Infrastructure
- [ ] [P0][M] Docker Compose: postgres + server + dashboard + public-page + test-app
- [ ] [P0][M] Dockerfile (single deployable: server serves dashboard + public page as static)
- [ ] [P0][M] Railway deployment config
- [ ] [P0][S] package.json workspace config
- [ ] [P0][S] tsconfig.base.json
- [ ] [P0][S] .env.example
- [ ] [P0][S] README.md

### 9.15 Testing
- [ ] [P0][M] Server unit tests: auth service
- [ ] [P0][M] Server unit tests: HTTP checker
- [ ] [P0][M] Server unit tests: alert evaluator
- [ ] [P0][M] Server unit tests: uptime calculator
- [ ] [P0][M] Server API tests: monitor CRUD
- [ ] [P0][M] Server API tests: incident CRUD
- [ ] [P0][M] Server API tests: component CRUD
- [ ] [P0][M] Server API tests: public status API
- [ ] [P0][S] Dashboard component tests: monitor list, incident form

### 9.16 Production-Grade Infrastructure
- [ ] [P0][M] Global error handler: structured JSON errors, log stack traces
- [ ] [P0][S] Health check endpoint: GET /health → { status, db, uptime, version }
- [ ] [P0][M] Rate limiting: express-rate-limit on auth + API endpoints
- [ ] [P0][S] Helmet.js security headers
- [ ] [P0][S] Request compression (gzip/brotli)
- [ ] [P0][M] Structured JSON logging with requestId, userId, duration per request
- [ ] [P0][S] Graceful shutdown: SIGTERM/SIGINT → drain connections, close DB
- [ ] [P0][S] Request timeout middleware (30s)
- [ ] [P0][M] Input validation: Zod schemas on ALL endpoints
- [ ] [P0][S] Consistent response envelope: { data, meta, error } on all responses
- [ ] [P0][S] Descriptive error codes: MONITOR_NOT_FOUND, INVALID_CREDENTIALS, etc.
- [ ] [P0][M] Audit log: record who changed what (monitors, incidents, components, settings)
- [ ] [P1][M] Retry logic with exponential backoff for external calls (email, webhooks)
- [ ] [P1][S] Dead letter queue for failed notifications (store for retry)
- [ ] [P1][S] Metrics endpoint: GET /metrics → requestCount, avgResponseTime, etc.
- [ ] [P1][S] API versioning: /api/v1/ prefix
- [ ] [P0][S] Database indexes on all foreign keys and frequently queried columns
- [ ] [P0][S] Pagination on all list endpoints (default 50, max 100)
- [ ] [P1][M] Data retention: auto-cleanup old MonitorCheck data (configurable days)
- [ ] [P0][S] Soft deletes for Organization and Member (deletedAt field)
- [ ] [P1][M] Docker multi-stage build (minimize image size)
- [ ] [P0][S] .env in .gitignore, secrets never committed

### 9.17 Comprehensive Testing
- [ ] [P0][M] Test infrastructure: factory helpers (createTestUser, createTestOrg, createTestMonitor)
- [ ] [P0][S] Test database setup (.env.test, separate DB)
- [ ] [P0][S] Test cleanup: truncate/reset between suites
- [ ] [P0][M] **Auth tests** (8+): register happy/duplicate/missing fields, login valid/invalid/missing, me with/without token
- [ ] [P0][M] **Monitor CRUD tests** (10+): create each type, list, get, update, delete, pause/resume, invalid type, unauthorized
- [ ] [P0][M] **Monitor checks tests** (15+): HTTP 200/500/timeout/keyword/method, TCP connect/refuse, SSL valid/expiring/expired, ping, heartbeat within/outside grace, DNS resolve/fail
- [ ] [P0][M] **Alert evaluator tests** (8+): consecutive failures trigger DOWN, recovery after UP streak, no alert on single failure, already alerted no duplicate, degraded threshold
- [ ] [P0][M] **Uptime calculator tests** (6+): 100% uptime, 0% uptime, mixed, empty checks, single check, uptime bars grouping
- [ ] [P0][M] **Component CRUD tests** (8+): create, list, update status, delete, reorder, groups CRUD, cascade
- [ ] [P0][M] **Incident tests** (10+): create, list, get with updates, add update with status change, resolve, affect components, scheduled maintenance, delete, unauthorized
- [ ] [P0][M] **Subscriber tests** (8+): subscribe, confirm, unsubscribe, duplicate email, component subscriptions, admin list/delete
- [ ] [P0][M] **Notification tests** (6+): email dispatch, webhook dispatch, Slack dispatch, test notification, failed dispatch retry
- [ ] [P0][M] **Public API tests** (8+): get status, get incidents, get uptime, get metrics, invalid slug, SSE connection
- [ ] [P0][M] **API key tests** (6+): create, list, revoke, auth with key, scoped access, invalid key
- [ ] [P0][L] **Flow tests** (10+): full onboarding (register→create monitor→create component→verify), incident lifecycle (create→update→resolve→notify), monitor alert flow (create monitor→check fails→alert→notify→recover), subscriber flow (subscribe→confirm→incident→email received→unsubscribe), API key flow (create key→use key→revoke→rejected)
- [ ] [P0][M] **Data integrity tests** (5+): foreign key constraints, unique constraints, cascade deletes, concurrent updates, transaction rollback
- [ ] [P0][S] **SSE tests** (3+): connect, receive event on status change, disconnect cleanup

**Total: ~170 TODO items**

---

## 10. Agent Team Design

### Wave 1: Foundation (3 agents, parallel)

#### Agent 1: Shared Package Builder
- **Role**: Build the shared types, constants, and utilities package
- **Owns**: `packages/shared/`
- **Builds**: All shared types, enums, constants, utility functions, package config
- **Depends on**: Nothing
- **Verifier**: TypeScript compiles, all types exported correctly, `npm run build` succeeds

#### Agent 2: Database & Auth Agent
- **Role**: Build Prisma schema, migrations, seed, and auth system
- **Owns**: `packages/server/prisma/`, `packages/server/src/routes/auth.ts`, `packages/server/src/middleware/`, `packages/server/src/index.ts`
- **Builds**: Prisma schema, migrations, seed script, auth routes, JWT middleware, API key middleware, error handling, CORS, server entry point
- **Depends on**: Agent 1 (shared types) — but can work in parallel using the PLAN types
- **Verifier**: Prisma generates successfully, seed runs, auth endpoints return JWT, middleware validates tokens

#### Agent 3: Monitoring Engine Agent
- **Role**: Build all uptime check implementations and the scheduler
- **Owns**: `packages/server/src/monitor/`, `packages/server/src/routes/heartbeat.ts`
- **Builds**: HTTP/TCP/Ping/SSL/Heartbeat checkers, scheduler, result processor, alert evaluator, uptime cache, heartbeat endpoint
- **Depends on**: Agent 1 (shared types)
- **Verifier**: HTTP checker correctly validates status codes and keywords, scheduler picks up due monitors, alert evaluator triggers after N consecutive failures, unit tests pass

### Wave 2: API & Notifications (3 agents, parallel)

#### Agent 4: API Routes Agent
- **Role**: Build all CRUD API routes
- **Owns**: `packages/server/src/routes/` (except auth.ts, heartbeat.ts), `packages/server/src/services/`
- **Builds**: Monitor CRUD, component CRUD, component group CRUD, incident CRUD, incident updates, subscriber management, notification channel CRUD, API key CRUD, status page config, public API
- **Depends on**: Agent 2 (Prisma schema, auth middleware)
- **Verifier**: All endpoints return correct data, validation rejects bad input, auth required on protected routes, API tests pass

#### Agent 5: Notifications & SSE Agent
- **Role**: Build notification dispatchers and real-time SSE
- **Owns**: `packages/server/src/notifications/`, `packages/server/src/sse/`
- **Builds**: Email dispatcher, webhook dispatcher, Slack dispatcher, subscriber notification on incidents, SSE manager, dashboard SSE, public page SSE, broadcast triggers
- **Depends on**: Agent 2 (Prisma, routes structure)
- **Verifier**: SSE connections work, notifications dispatch on incident create, webhook sends correct payload

#### Agent 6: Test App Agent
- **Role**: Build the test application with various endpoints
- **Owns**: `test-app/`
- **Builds**: Express app with /health, /slow, /flaky, /crash endpoints, setup script
- **Depends on**: Nothing
- **Verifier**: All endpoints respond correctly, setup script creates monitors via API

### Wave 3: Frontend (3 agents, parallel)

#### Agent 7: Dashboard Shell & Pages Agent
- **Role**: Build the admin dashboard UI
- **Owns**: `packages/dashboard/`
- **Builds**: App shell, routing, auth pages, API client, SSE hook, all page layouts (monitors, components, incidents, subscribers, notifications, settings, API keys), dark mode, responsive layout
- **Depends on**: Agent 4 (API shape), Agent 1 (shared types)
- **Verifier**: App builds without errors, all routes render, forms submit correctly, dark mode works

#### Agent 8: Dashboard Visualizations & Learn Agent
- **Role**: Build charts, uptime bars, tooltips, and Learn page
- **Owns**: `packages/dashboard/src/components/charts/`, `packages/dashboard/src/components/Tooltip.tsx`, `packages/dashboard/src/pages/Learn.tsx`
- **Builds**: Response time line charts, uptime percentage charts, monitor sparklines, 60+ tooltips, 10 Learn page topics
- **Depends on**: Agent 7 (dashboard shell)
- **Verifier**: Charts render with mock data, tooltips appear on hover, Learn page has all 10 topics

#### Agent 9: Public Status Page Agent
- **Role**: Build the public-facing status page
- **Owns**: `packages/public-page/`
- **Builds**: Status page layout, component list with status, 90-day uptime bars, active incidents, incident history, subscribe form, response time charts, dark mode, SSE real-time, mobile responsive
- **Depends on**: Agent 1 (shared types), API shape from Agent 4
- **Verifier**: Page renders with mock data, uptime bars display correctly, subscribe form works, dark mode toggles, responsive on mobile

### Wave 4: Integration (1 agent)

#### Agent 10: Orchestrator & Deployer
- **Role**: Wire everything together, fix integration issues, deploy
- **Owns**: Root config files, Dockerfile, docker-compose.yml, README.md
- **Builds**: Workspace config, tsconfig chain, Dockerfile (single deployable), docker-compose, .env.example, README, integration fixes
- **Depends on**: All other agents
- **Verifier**: `npm install` succeeds, TypeScript compiles across all packages, all tests pass, dev servers start, Docker builds, end-to-end smoke test

---

## 11. Execution Timeline

| Wave | Agents | Est. Time | Output |
|------|--------|-----------|--------|
| 1 | Shared + DB/Auth + Monitoring Engine | 8-10 min | Foundation ready |
| 2 | API Routes + Notifications/SSE + Test App | 8-10 min | Full backend ready |
| 3 | Dashboard + Visualizations/Learn + Public Page | 10-12 min | Full frontend ready |
| 4 | Orchestrator | 5-8 min | Integrated + deployed |
| **Total** | **10 agents** | **~35 min** | **Production-ready** |
