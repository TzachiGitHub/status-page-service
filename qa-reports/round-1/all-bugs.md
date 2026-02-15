Total unique bugs: 57

# Consolidated QA Bug Report — Round 1
**Date**: 2026-02-15
**Sources**: QA-1 (Auth), QA-2 (CRUD), QA-3 (UI/UX), QA-4 (API Edge Cases), QA-5 (Data Integrity)

---

## CRITICAL (3)

### BUG-001: Hardcoded JWT Secret Fallback Allows Token Forgery
- **Severity**: critical
- **Sources**: QA-1 BUG-1
- **Location**: `packages/server/src/routes/auth.ts` line 24, `packages/server/src/middleware/auth.ts` line 25
- **Steps to reproduce**:
  1. Observe `process.env.JWT_SECRET || 'secret'` in both `signToken()` and `authenticate()`
  2. If `JWT_SECRET` env var is unset or empty, the literal string `'secret'` is used
  3. Attacker signs a forged JWT with `jwt.sign({userId:'x',orgId:'y',role:'OWNER'}, 'secret')` and gains full access
- **Expected**: Server should refuse to start if `JWT_SECRET` is not set
- **Actual**: Falls back to the guessable string `'secret'`, allowing trivial token forgery

### BUG-002: Registration Completely Broken From Dashboard — Missing `orgName` Field
- **Severity**: critical
- **Sources**: QA-1 BUG-5
- **Location**: `packages/dashboard/src/stores/authStore.ts` line 14, `packages/server/src/routes/auth.ts` line 12
- **Steps to reproduce**:
  1. Server register schema requires `orgName`, `name`, `email`, `password`
  2. Dashboard `register()` sends `{ email, password, name }` — no `orgName`
  3. Attempt to register via dashboard → 400 validation error
- **Expected**: Registration succeeds
- **Actual**: Server returns 400: `orgName` is required. Registration is completely broken from the dashboard.

### BUG-003: Subscriber Token Leaked in API Responses — Bypasses Email Verification
- **Severity**: critical
- **Sources**: QA-2 BUG-10, QA-2 BUG-11, QA-5 BUG-6, QA-5 BUG-7, QA-5 BUG-15
- **Location**: `packages/server/src/services/subscriberService.ts` lines 5, 13 (`list` and `subscribe` functions)
- **Steps to reproduce**:
  1. POST `/api/subscribers/acme-corp/subscribe` with `{"email":"test@example.com"}` → response includes `token`
  2. Attacker calls `/api/subscribers/confirm/<token>` to bypass email verification
  3. Admin GET `/api/subscribers` also exposes all subscriber tokens
  4. Double-subscribing same email returns existing record with token (takeover vector)
- **Expected**: Token should only be sent via confirmation email; admin list should omit/redact tokens
- **Actual**: Token returned in subscribe response, admin list, and double-subscribe response
- **Evidence**: `{"data":{"token":"10f96032-01f9-45fc-a755-cdc02d788d8e",...}}`

---

## HIGH (14)

### BUG-004: No Role-Based Authorization — Any Authenticated User Has Full Access
- **Severity**: high
- **Sources**: QA-1 BUG-7, QA-2 BUG-16
- **Location**: `packages/server/src/middleware/auth.ts`, all route files
- **Steps to reproduce**:
  1. JWT payload contains `role` field but `authenticate` middleware never checks it
  2. No route checks `req.user.role` before allowing destructive operations
  3. Only `apiKeys.ts` has any role checking (`requireAdmin`)
- **Expected**: VIEWER=read-only, EDITOR=no delete, only ADMIN/OWNER manage settings
- **Actual**: Role stored in token but never enforced; any authenticated user can do anything

### BUG-005: No Rate Limiting on Login Endpoint — Brute Force Possible
- **Severity**: high
- **Sources**: QA-1 BUG-2
- **Location**: `packages/server/src/routes/auth.ts`, `packages/server/src/index.ts` line 37
- **Steps to reproduce**:
  1. Send 10+ rapid `POST /api/auth/login` requests with wrong passwords
  2. All return 401 with no throttling or lockout
- **Expected**: After N failed attempts, rate-limit or lock account
- **Actual**: Unlimited login attempts allowed

### BUG-006: No Server-Side Logout / Token Revocation
- **Severity**: high
- **Sources**: QA-1 BUG-3
- **Location**: `packages/server/src/routes/auth.ts` (missing endpoint), `packages/dashboard/src/stores/authStore.ts` line 18
- **Steps to reproduce**:
  1. `POST /api/auth/logout` → `Cannot POST /api/auth/logout`
  2. Dashboard logout only does `localStorage.removeItem('token')` client-side
  3. Old token remains valid for up to 7 days
- **Expected**: Server-side endpoint that invalidates/blacklists the token
- **Actual**: No logout endpoint; tokens cannot be revoked

### BUG-007: CORS Allows All Origins — Any Domain Can Make Authenticated Requests
- **Severity**: high
- **Sources**: QA-1 BUG-4, QA-4 BUG-17
- **Location**: `packages/server/src/index.ts` line 23 — `app.use(cors())`
- **Steps to reproduce**:
  1. Send request with `Origin: http://evil.com`
  2. Response: `access-control-allow-origin: *`
- **Expected**: CORS restricted to dashboard domain
- **Actual**: Any origin accepted

### BUG-008: XSS Payloads Stored Unsanitized in All String Fields
- **Severity**: high
- **Sources**: QA-4 BUG-1
- **Location**: All create/update endpoints — `componentService.ts`, `incidentService.ts`, `auth.ts`, etc.
- **Steps to reproduce**:
  1. POST `/api/components` with `{"name":"<script>alert(1)</script>"}`
  2. Payload stored verbatim and returned in responses
- **Expected**: XSS payloads sanitized/escaped or rejected
- **Actual**: Stored verbatim. Affects: component name/description, incident title/message, monitor name, org name, user name, notification config, customCss
- **Evidence**: Public status page renders these values, including for unauthenticated visitors

### BUG-009: Monitor Type-Specific Validation Missing — HTTP Without URL, TCP Without Target
- **Severity**: high
- **Sources**: QA-2 BUG-1, QA-2 BUG-2, QA-2 BUG-3
- **Location**: `packages/server/src/validation/monitors.ts` line 5
- **Steps to reproduce**:
  1. POST `/api/monitors` with `{"name":"test","type":"HTTP"}` (no URL) → 201
  2. POST with `{"name":"test","type":"HTTP","url":"not-a-url"}` → 201
  3. POST with `{"name":"test","type":"TCP"}` (no target) → 201
- **Expected**: HTTP requires valid URL; TCP/PING/DNS/SSL require target/host
- **Actual**: All fields optional, no URL format validation, no type-specific requirements

### BUG-010: Foreign Key Violations Return 500 Instead of Proper Error
- **Severity**: high
- **Sources**: QA-2 BUG-4, QA-2 BUG-5, QA-4 BUG-11
- **Location**: `packages/server/src/services/componentService.ts` line 12, `incidentService.ts` line 30
- **Steps to reproduce**:
  1. POST `/api/components` with non-existent `groupId` → 500
  2. POST `/api/incidents` with non-existent `componentIds` → 500
- **Expected**: 404/422 with "not found" message
- **Actual**: Unhandled Prisma FK constraint error → 500 Internal Server Error

### BUG-011: No Team/Member Management Endpoints
- **Severity**: high
- **Sources**: QA-2 BUG-15
- **Location**: `packages/server/src/index.ts` — no member routes registered
- **Steps to reproduce**:
  1. GET `/api/members` → 404
  2. GET `/api/team` → 404
- **Expected**: CRUD for team members (list, invite, update role, remove) per Member model in schema
- **Actual**: Member model exists in schema but no routes. No way to invite, change roles, or remove members.

### BUG-012: Dashboard Pages Missing Error Handling on API Calls
- **Severity**: high
- **Sources**: QA-3 BUG-6, BUG-7, BUG-8, BUG-9, BUG-10, BUG-11, BUG-26
- **Location**: Multiple dashboard pages — `ComponentsPage.tsx`, `IncidentsPage.tsx`, `IncidentDetailPage.tsx`, `MonitorDetailPage.tsx`, `SubscribersPage.tsx`, `NotificationsPage.tsx`, `SettingsPage.tsx`
- **Steps to reproduce**:
  1. Trigger any API error on any dashboard page (e.g., network failure, 500)
  2. No error message shown to user; unhandled promise rejections
- **Affected operations**: `handleSave`, `handleDelete`, `handleStatusChange`, `moveComponent`, `handleCreate`, `handleResolve`, `handleEditSave`, `handleAddUpdate`, `handlePause`, `handleResume`, `handleRevokeKey`
- **Expected**: Error feedback shown to user
- **Actual**: No catch blocks; silent failures; some use `finally` without `catch`; `SubscribersPage` optimistically updates state before API confirms

### BUG-013: MonitorModal Headers Field — Uncaught JSON.parse Crashes Form
- **Severity**: high
- **Sources**: QA-3 BUG-5
- **Location**: `packages/dashboard/src/components/MonitorModal.tsx` line ~85
- **Steps to reproduce**:
  1. Create HTTP monitor, enter invalid JSON in Headers field (`{bad`)
  2. Click "Create Monitor"
- **Expected**: Validation error telling user JSON is invalid
- **Actual**: `JSON.parse(headers)` throws uncaught SyntaxError; generic "Save failed" error at best

### BUG-014: Incident Reopening Does Not Clear resolvedAt Timestamp
- **Severity**: high
- **Sources**: QA-5 BUG-1
- **Location**: `packages/server/src/services/incidentService.ts`, `addUpdate()` ~line 50
- **Steps to reproduce**:
  1. Create incident → progress to RESOLVED (sets resolvedAt)
  2. Add update with status INVESTIGATING (reopen)
  3. Fetch incident: `status=INVESTIGATING, resolvedAt=2026-02-15T07:09:25.307Z`
- **Expected**: `resolvedAt` cleared to null on reopen
- **Actual**: `resolvedAt` retains old timestamp. Code only sets on RESOLVED, never clears:
  ```typescript
  const resolvedAt = data.status === 'RESOLVED' ? new Date() : undefined;
  ```

### BUG-015: Incidents Don't Sync Component Status (Create or Resolve)
- **Severity**: high
- **Sources**: QA-5 BUG-2, QA-5 BUG-3
- **Location**: `packages/server/src/services/incidentService.ts`, `create()` and `addUpdate()` functions
- **Steps to reproduce**:
  1. Component "API" status is OPERATIONAL
  2. Create incident with `componentIds: ["..."]` and `componentStatus: "MAJOR_OUTAGE"`
  3. Component status remains OPERATIONAL
  4. Resolve incident → component still unchanged
- **Expected**: Component status updated to match incident severity; restored on resolution
- **Actual**: `IncidentComponent` junction stores status but `Component.status` is never updated. Components get stuck if manually changed.

### BUG-016: Monitor `status` Field Never Updated — Only `currentStatus` Written
- **Severity**: high
- **Sources**: QA-5 BUG-4, QA-5 BUG-12
- **Location**: `packages/server/src/monitor/processor.ts` line ~52
- **Steps to reproduce**:
  1. Create HTTP monitor, wait for check
  2. `status` remains UNKNOWN; only `currentStatus` is updated
  3. `GET /api/monitors?status=UP` returns empty (filter uses `status` field)
- **Expected**: `status` field updated alongside `currentStatus`
- **Actual**: `processCheckResult` only writes `currentStatus`. The `status` enum field stays UNKNOWN forever. DB index on `status` is wasted.

### BUG-017: Heartbeat Monitor Created Without `heartbeatToken`
- **Severity**: high
- **Sources**: QA-5 BUG-5
- **Location**: `packages/server/src/services/monitorService.ts`, `create()` function
- **Steps to reproduce**:
  1. POST `/api/monitors` with `{"name":"hb","type":"HEARTBEAT"}`
  2. `heartbeatToken` is null
- **Expected**: Unique token auto-generated so external services can ping it
- **Actual**: No token generated; heartbeat endpoint cannot identify this monitor

---

## MEDIUM (23)

### BUG-018: Error Responses Leak Internal Details (Prisma Errors, Stack Traces)
- **Severity**: medium
- **Sources**: QA-1 BUG-9, QA-1 BUG-10, QA-4 BUG-4, QA-4 BUG-16
- **Location**: `packages/server/src/routes/auth.ts` lines 44, 58, 67, 80, 81, 100
- **Steps to reproduce**:
  1. Register with duplicate org name → response includes full Prisma error: `"Unique constraint failed on the fields: (\`slug\`)"`
  2. Trigger any auth error → `(err as Error).message` returned directly
- **Expected**: Generic error messages; internals logged server-side only
- **Actual**: Auth routes have their own try/catch that always includes `message` field regardless of `NODE_ENV`

### BUG-019: Pagination Validation Missing — Negative/Zero/Huge Values Accepted
- **Severity**: medium
- **Sources**: QA-2 BUG-8, QA-2 BUG-9, QA-4 BUG-2, QA-4 BUG-5, QA-4 BUG-6, QA-4 BUG-7
- **Location**: All services with pagination — `incidentService.ts`, `monitorService.ts`, `subscriberService.ts`
- **Steps to reproduce**:
  1. `?page=-1` → 500 (negative skip in Prisma)
  2. `?limit=0` or `?limit=-1` → returns all records
  3. `?limit=999999` → accepted, potential DoS
  4. `?page=0` → silently treated as page 1
- **Expected**: Validate page≥1, 1≤limit≤100, return 400 on invalid
- **Actual**: No query parameter validation; raw values passed to Prisma

### BUG-020: Invalid Enum Filters Cause 500 Internal Server Error
- **Severity**: medium
- **Sources**: QA-2 BUG-6, QA-2 BUG-7, QA-4 BUG-3
- **Location**: `packages/server/src/services/incidentService.ts` line 10, `monitorService.ts` lines 7-8
- **Steps to reproduce**:
  1. `GET /api/incidents?status=INVALID` → 500
  2. `GET /api/monitors?status=BOGUS` → 500
  3. `GET /api/monitors?type=BOGUS` → 500
- **Expected**: 400 with invalid value message, or ignore invalid filter
- **Actual**: Prisma rejects invalid enum values → unhandled 500

### BUG-021: Query Parameter Validation Missing — NaN and Extreme Values Crash Server
- **Severity**: medium
- **Sources**: QA-4 BUG-9, QA-4 BUG-10, QA-4 BUG-19
- **Location**: `packages/server/src/routes/components.ts` line 38, `statusPageService.ts` line 63
- **Steps to reproduce**:
  1. `GET /api/components/:id/history?days=abc` → 500 (NaN propagates)
  2. `GET /api/public/acme-corp/uptime?days=999999999` → 500 (overflow)
  3. `GET /api/public/acme-corp/uptime?days=-10` → returns misleading 100% uptime
- **Expected**: Validate numeric params, clamp to reasonable range
- **Actual**: `Number("abc")` → NaN; huge values overflow date calculation

### BUG-022: Notification Channel Config Not Validated — Accepts Empty/Malicious Config
- **Severity**: medium
- **Sources**: QA-2 BUG-12, QA-4 BUG-13, QA-4 BUG-18
- **Location**: `packages/server/src/validation/notificationChannels.ts` line 5 — `config: z.record(z.string(), z.unknown())`
- **Steps to reproduce**:
  1. POST with `{"name":"test","type":"SLACK","config":{}}` → 201 (empty config accepted)
  2. POST with `{"type":"WEBHOOK","config":{"url":"javascript:alert(1)"}}` → 201
- **Expected**: Type-specific validation (SLACK needs webhookUrl, WEBHOOK needs https URL, EMAIL needs addresses)
- **Actual**: Any value accepted; channels will fail silently when sending; `javascript:` URLs accepted

### BUG-023: Password Minimum Length Too Weak (6 Characters, No Complexity)
- **Severity**: medium
- **Sources**: QA-1 BUG-6, QA-3 BUG-18
- **Location**: `packages/server/src/routes/auth.ts` line 16, `packages/dashboard/src/pages/RegisterPage.tsx`
- **Steps to reproduce**:
  1. Register with password `123456` → succeeds (server: `z.string().min(6)`)
  2. Dashboard has no client-side length validation (only `required`)
- **Expected**: Minimum 8+ characters with complexity requirements
- **Actual**: Server accepts 6 chars; dashboard accepts 1 char

### BUG-024: JWT 7-Day Expiration With No Refresh Token Flow
- **Severity**: medium
- **Sources**: QA-1 BUG-8
- **Location**: `packages/server/src/routes/auth.ts` line 24
- **Steps to reproduce**: Login → token valid for 7 full days with no revocation (see BUG-006)
- **Expected**: Short-lived access token (15-60 min) with refresh token rotation
- **Actual**: Single long-lived token; no refresh mechanism

### BUG-025: No Size Limit on customCss Field — Accepts 100KB+ Data
- **Severity**: medium
- **Sources**: QA-2 BUG-18, QA-4 BUG-14
- **Location**: `packages/server/src/validation/statusPage.ts` line 7 — `customCss: z.string().optional().nullable()`
- **Steps to reproduce**: PATCH `/api/status-page/config` with 100,000+ char customCss → accepted
- **Expected**: Limit to reasonable size (e.g., 50KB)
- **Actual**: No length limit; arbitrary data stored

### BUG-026: Incident Created With RESOLVED Status Has Null resolvedAt
- **Severity**: medium
- **Sources**: QA-2 BUG-13
- **Location**: `packages/server/src/services/incidentService.ts` line 24
- **Steps to reproduce**: POST `/api/incidents` with `{"title":"test","message":"test","status":"RESOLVED"}` → `resolvedAt: null`
- **Expected**: `resolvedAt` set to current timestamp
- **Actual**: `resolvedAt` is null despite RESOLVED status

### BUG-027: Subscriber Type Field Ignored — Always Creates EMAIL
- **Severity**: medium
- **Sources**: QA-2 BUG-17
- **Location**: `packages/server/src/services/subscriberService.ts` line 11, `validation/subscribers.ts`
- **Steps to reproduce**: POST subscribe with `{"email":"test@example.com","type":"WEBHOOK"}` → type is EMAIL
- **Expected**: Respect type field or reject unsupported types
- **Actual**: Validation schema excludes `type`; always creates EMAIL

### BUG-028: Monitor Type Can Be Changed Via PATCH Without Re-validating Fields
- **Severity**: medium
- **Sources**: QA-2 BUG-20
- **Location**: `packages/server/src/validation/monitors.ts` — `UpdateMonitorSchema = CreateMonitorSchema.partial()`
- **Steps to reproduce**: PATCH monitor with `{"type":"TCP"}` → type changes but retains HTTP fields, no target
- **Expected**: Re-validate type-specific required fields on type change
- **Actual**: Type changed; monitor left in inconsistent state (TCP with url, no target)

### BUG-029: Unsupported HTTP Methods Return HTML Error Instead of JSON
- **Severity**: medium
- **Sources**: QA-4 BUG-15
- **Location**: Express default 404 handler (not overridden)
- **Steps to reproduce**: `PUT /api/components/:id` → HTML: `<pre>Cannot PUT /api/components/...</pre>` (404, text/html)
- **Expected**: JSON `{"error":"Method not allowed"}` with 405
- **Actual**: HTML error page from Express default handler

### BUG-030: Dashboard and Public Page Routing Conflict
- **Severity**: medium
- **Sources**: QA-3 BUG-20
- **Location**: Server routing — dashboard at `/`, public page at `/status/`
- **Steps to reproduce**:
  1. Visit `/` → shows dashboard login (even for public visitors)
  2. Visit `/status` → redirects to `/status/` → public page
- **Expected**: Clear separation; public visitors shouldn't see dashboard login
- **Actual**: Root shows dashboard to everyone; public users wouldn't know to go to `/status`

### BUG-031: Public Page Subscribe Endpoint Mismatch
- **Severity**: medium
- **Sources**: QA-3 BUG-16
- **Location**: `packages/public-page/src/components/SubscribeForm.tsx` line ~16
- **Steps to reproduce**: Enter email on public page → posts to `/api/subscribe` vs expected `/api/public/{slug}/...` pattern
- **Expected**: Consistent API path pattern
- **Actual**: May 404 if server expects slug-scoped pattern

### BUG-032: Public Page Slug Detection Uses Entire Path
- **Severity**: medium
- **Sources**: QA-3 BUG-21
- **Location**: `packages/public-page/src/hooks/useStatusPage.ts`, `getSlug()`
- **Steps to reproduce**: Visit `/status/` → slug becomes `status`; nested paths produce multi-segment slugs
- **Expected**: Correct slug extraction
- **Actual**: `getSlug()` strips slashes and uses entire remaining path, which may not match server expectations

### BUG-033: OverviewPage Shows Empty State When All API Calls Fail — No Error Indication
- **Severity**: medium
- **Sources**: QA-3 BUG-13
- **Location**: `packages/dashboard/src/pages/OverviewPage.tsx`
- **Steps to reproduce**: Navigate to Overview when API is down
- **Expected**: Error message shown
- **Actual**: `Promise.allSettled` never throws; page renders with empty data looking like there's genuinely nothing

### BUG-034: Settings Page Toggle Has Conflicting Click Handlers
- **Severity**: medium
- **Sources**: QA-3 BUG-4
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`, `Toggle` component
- **Steps to reproduce**: Click a toggle switch → may fire twice
- **Actual**: `<input>` has `onChange` AND parent `<div>` has `onClick={() => onChange(!checked)}`. Clicking triggers both, potentially double-toggling.

### BUG-035: API Key Authentication Has No Permission Scoping
- **Severity**: medium
- **Sources**: QA-1 BUG-12
- **Location**: `packages/server/src/middleware/apiKey.ts`
- **Steps to reproduce**: Any API key for an org has full access — no read-only or scoped permissions
- **Expected**: API keys with configurable scopes (read, write, admin)
- **Actual**: `req.apiOrg = { orgId }` with no scope/permissions field

### BUG-036: Incident Service Does Not Call Notification Hooks
- **Severity**: medium
- **Sources**: QA-5 BUG-8
- **Location**: `packages/server/src/services/incidentService.ts`
- **Steps to reproduce**: Create/update incident → no SSE broadcast, no subscriber notifications
- **Expected**: `onIncidentChange` hook called for SSE and notification dispatch
- **Actual**: `incidentService` never imports or calls notification hooks

### BUG-037: No Real Maintenance Window Model — Just Regular Incidents
- **Severity**: medium
- **Sources**: QA-5 BUG-9
- **Location**: `packages/server/src/services/incidentService.ts`, `createScheduledMaintenance()`
- **Steps to reproduce**: Call `createScheduledMaintenance` → creates regular incident with status=MONITORING, severity=MINOR
- **Expected**: Distinct model with scheduledAt/scheduledUntil, future scheduling
- **Actual**: Wrapper that calls `create()` with hardcoded status/severity. No scheduling fields.

### BUG-038: Public Status Page Shows All Components Including Test Data
- **Severity**: medium
- **Sources**: QA-5 BUG-10
- **Location**: `packages/server/src/services/statusPageService.ts`, `getPublicStatus()`
- **Steps to reproduce**: Create test components → all visible on public page including XSS payloads
- **Expected**: Only curated/visible components shown
- **Actual**: No visibility filter; everything shown including test data and `<script>alert(1)</script>`

### BUG-039: Monitor Scheduler Loads ALL Monitors Every Tick (Empty OR Clause)
- **Severity**: medium
- **Sources**: QA-5 BUG-11
- **Location**: `packages/server/src/monitor/scheduler.ts`, `tick()` ~line 40
- **Steps to reproduce**: 1000 monitors with 1hr interval; scheduler ticks every 10s → loads all every time
- **Expected**: DB query filters monitors not due for checking
- **Actual**: Second OR branch is `{}` (empty), matching ALL records. Filtering in JS is wasteful at scale.

### BUG-040: API Key Can Be Created With Past Expiration Date
- **Severity**: medium
- **Sources**: QA-4 BUG-12
- **Location**: `packages/server/src/validation/apiKeys.ts` line 4
- **Steps to reproduce**: POST `/api/api-keys` with `{"name":"key","expiresAt":"2020-01-01T00:00:00Z"}` → created already expired
- **Expected**: Reject past dates
- **Actual**: No date validation; already-expired keys created

---

## LOW (17)

### BUG-041: Dashboard Login Error Reads Wrong Response Field
- **Severity**: low
- **Sources**: QA-1 BUG-11
- **Location**: `packages/dashboard/src/pages/LoginPage.tsx` line 20
- **Description**: Server returns `{ error: 'Invalid credentials' }` but dashboard reads `err.response.data.message` (undefined). Falls back to generic "Login failed" instead of actual error.

### BUG-042: Duplicate Component Names Allowed Within Same Organization
- **Severity**: low
- **Sources**: QA-2 BUG-14
- **Location**: `packages/server/src/services/componentService.ts`, `prisma/schema.prisma`
- **Description**: Two components with identical name "API" can be created in same org. No unique constraint on (orgId, name).

### BUG-043: Reorder Components With Non-Existent IDs Silently Succeeds
- **Severity**: low
- **Sources**: QA-2 BUG-19
- **Location**: `packages/server/src/services/componentService.ts` line 33
- **Description**: POST `/api/components/reorder` with fake IDs → `{"data":{"success":true}}` without updating anything.

### BUG-044: Component Update Uses Spread Pattern — Safe by Accident (Fragile)
- **Severity**: low
- **Sources**: QA-2 BUG-21
- **Location**: All services — `data` spread directly into Prisma update
- **Description**: `orgId` injection via PATCH is prevented only because Zod's default strip mode removes unknown fields. Pattern is fragile; enabling `.passthrough()` would make it exploitable.

### BUG-045: console.error Left in Production Code (Public Page)
- **Severity**: low
- **Sources**: QA-3 BUG-3
- **Location**: `packages/public-page/src/hooks/useStatusPage.ts` line ~68
- **Description**: `console.error(e)` logs errors to browser console in production.

### BUG-046: Dashboard Uses Native confirm()/alert() Dialogs
- **Severity**: low
- **Sources**: QA-3 BUG-17, QA-3 BUG-12, QA-3 BUG-11
- **Location**: `MonitorDetailPage.tsx`, `ComponentsPage.tsx`, `IncidentDetailPage.tsx`, `SubscribersPage.tsx`, `NotificationsPage.tsx`, `SettingsPage.tsx`
- **Description**: All destructive actions use `confirm()`. Some error/success feedback uses `alert()`. Jarring and inconsistent with the styled dark theme UI.

### BUG-047: Public Page SSE Race Condition With Initial Data Fetch
- **Severity**: low
- **Sources**: QA-3 BUG-15
- **Location**: `packages/public-page/src/hooks/useStatusPage.ts`
- **Description**: SSE `useEffect` and `fetchAll` both run on mount simultaneously. SSE event arriving before `fetchAll` completes could update empty state or be overwritten.

### BUG-048: SettingsPage CNAME Instruction Uses Placeholder Hostname
- **Severity**: low
- **Sources**: QA-3 BUG-19
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`
- **Description**: Hardcoded `statuspage.yourhost.com` in CNAME instructions — not a real address.

### BUG-049: MonitorModal setInterval Variable Shadows Global
- **Severity**: low
- **Sources**: QA-3 BUG-22
- **Location**: `packages/dashboard/src/components/MonitorModal.tsx`
- **Description**: `const [interval, setInterval] = useState(...)` shadows `window.setInterval`. Code smell; could cause confusing issues during maintenance.

### BUG-050: Public Page No Empty State for Components
- **Severity**: low
- **Sources**: QA-3 BUG-23
- **Location**: `packages/public-page/src/components/ComponentList.tsx`
- **Description**: When no components exist, renders blank section with no "No components configured" message.

### BUG-051: OverviewPage Uptime Calc Edge Case — All Monitors Paused Shows 0%
- **Severity**: low
- **Sources**: QA-3 BUG-24
- **Location**: `packages/dashboard/src/pages/OverviewPage.tsx`
- **Description**: When all monitors paused, `monitors.length - paused = 0`, fallback to 1, shows 0%. Should show "N/A".

### BUG-052: Monitors Table Not Responsive on Small Screens
- **Severity**: low
- **Sources**: QA-3 BUG-14
- **Location**: `packages/dashboard/src/pages/MonitorsPage.tsx`
- **Description**: Table wrapper has no `overflow-x-auto`. Some columns hidden on mobile but remaining may still overflow.

### BUG-053: Negative Order Value Accepted for Components
- **Severity**: low
- **Sources**: QA-4 BUG-8
- **Location**: `packages/server/src/validation/components.ts` line 6
- **Description**: Component created with `order: -999` accepted. Should validate `order >= 0`.

### BUG-054: Alert Model incidentId Has No Foreign Key Constraint
- **Severity**: low
- **Sources**: QA-5 BUG-14
- **Location**: `packages/server/prisma/schema.prisma`, Alert model
- **Description**: `incidentId` is plain optional String with no `@relation`. Orphaned values can point to deleted incidents.

### BUG-055: Public Uptime Returns 100% for Unmonitored Components
- **Severity**: low
- **Sources**: QA-5 BUG-13
- **Location**: `packages/server/src/services/statusPageService.ts`, `getPublicUptime()`
- **Description**: Components with no monitors return `uptime: 100` which is misleading. Should indicate "no data" or be excluded.

### BUG-056: Learn Page Is Dead Code — Not Routed, Hardcodes Light Theme
- **Severity**: low
- **Sources**: QA-3 BUG-1, QA-3 BUG-2
- **Location**: `packages/dashboard/src/pages/Learn.tsx`
- **Description**: Learn component exported but never imported/routed. No nav item links to it. Additionally hardcodes light-only colors (`text-gray-900`, `bg-white`) with no `dark:` variants.

### BUG-057: SettingsPage Has Two Save Buttons That Save Everything
- **Severity**: low
- **Sources**: QA-3 BUG-25
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`
- **Description**: "Save Settings" in config section and "Save" in Custom Domain section both call same `handleSave` sending entire config. Misleading — clicking one silently saves the other section too.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 14 |
| Medium | 23 |
| Low | 17 |
| **Total** | **57** |
