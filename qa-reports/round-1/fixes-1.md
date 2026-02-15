# Fixes Report — Dev Agent 1 (BUG-001 through BUG-019)

**Date**: 2026-02-15
**All 3 packages build successfully after fixes.**

---

## BUG-001: Hardcoded JWT Secret Fallback (CRITICAL)
- **Files**: `packages/server/src/routes/auth.ts`, `packages/server/src/middleware/auth.ts`
- **Fix**: Removed `|| 'secret'` fallback. Added `getJwtSecret()` helper that throws if `JWT_SECRET` env var is missing. Auth middleware returns 500 if secret not configured.

## BUG-002: Registration Broken — Missing orgName (CRITICAL)
- **Files**: `packages/dashboard/src/stores/authStore.ts`, `packages/dashboard/src/pages/RegisterPage.tsx`
- **Fix**: Added `orgName` parameter to `register()` function signature and API call. Added "Organization Name" input field to RegisterPage.

## BUG-003: Subscriber Token Leaked in API Responses (CRITICAL)
- **Files**: `packages/server/src/services/subscriberService.ts`
- **Fix**: `list()` now uses `select` to explicitly exclude `token` field. `subscribe()` now returns only `{id, email, confirmed, message}` instead of the full record with token. Double-subscribe returns generic "Already subscribed" message.

## BUG-004: No Role-Based Authorization (HIGH)
- **Files**: `packages/server/src/middleware/auth.ts`, `packages/server/src/routes/components.ts`, `packages/server/src/routes/monitors.ts`, `packages/server/src/routes/incidents.ts`
- **Fix**: Added `requireRole()` and `requireMinRole()` middleware with role hierarchy (VIEWER < EDITOR < ADMIN < OWNER). Applied to routes: create/update require EDITOR+, delete requires ADMIN+, read available to all authenticated.

## BUG-005: No Rate Limiting on Login (HIGH)
- **Files**: `packages/server/src/routes/auth.ts`, `packages/server/package.json`
- **Fix**: Installed `express-rate-limit`. Added login limiter (10 attempts/15 min) and register limiter (5 attempts/hour).

## BUG-006: No Server-Side Logout / Token Revocation (HIGH)
- **Files**: `packages/server/src/routes/auth.ts`, `packages/server/src/middleware/auth.ts`, `packages/server/src/lib/tokenBlacklist.ts`, `packages/dashboard/src/stores/authStore.ts`
- **Fix**: Added `POST /api/auth/logout` endpoint. Created in-memory token blacklist (checked in authenticate middleware). Dashboard logout now calls server endpoint before clearing local storage.

## BUG-007: CORS Allows All Origins (HIGH)
- **Files**: `packages/server/src/index.ts`
- **Fix**: Replaced `cors()` with configurable CORS using `CORS_ORIGINS` env var (comma-separated). Falls back to permissive only if env var not set (development convenience).

## BUG-008: XSS Payloads Stored Unsanitized (HIGH)
- **Files**: `packages/server/src/middleware/sanitize.ts` (new), `packages/server/src/index.ts`
- **Fix**: Created `sanitizeBody` middleware using `xss` library. Applied globally after `express.json()`. Recursively sanitizes all string values in request bodies. Also added `1mb` body size limit.

## BUG-009: Monitor Type-Specific Validation Missing (HIGH)
- **Files**: `packages/server/src/validation/monitors.ts`
- **Fix**: Added `.superRefine()` to `CreateMonitorSchema` with type-specific validation: HTTP requires valid URL, TCP requires host+port, PING/DNS/SSL require host. Added `url()` format validation. Added `host`, `port`, `config`, `regions`, `alertAfter`, `recoverAfter` fields to schema.

## BUG-010: Foreign Key Violations Return 500 (HIGH)
- **Files**: `packages/server/src/middleware/errorHandler.ts`
- **Fix**: Enhanced error handler to catch Prisma error codes: P2003 (FK violation) → 422, P2002 (unique constraint) → 409, P2025 (not found) → 404. Also catches `PrismaClientValidationError` (invalid enum) → 400.

## BUG-011: No Team/Member Management Endpoints (HIGH)
- **Status**: Not fixed in this round — requires new routes, service, and validation files. Flagged for next iteration.

## BUG-012: Dashboard Pages Missing Error Handling (HIGH)
- **Files**: `packages/dashboard/src/pages/ComponentsPage.tsx`, `IncidentsPage.tsx`, `IncidentDetailPage.tsx`, `MonitorDetailPage.tsx`, `SubscribersPage.tsx`, `NotificationsPage.tsx`, `SettingsPage.tsx`
- **Fix**: Added try/catch blocks with user-facing error messages to all async operations: `handleSave`, `handleDelete`, `handleStatusChange`, `moveComponent`, `handleCreate`, `handleResolve`, `handleEditSave`, `handleAddUpdate`, `handlePause`, `handleResume`, `handleRevokeKey`.

## BUG-013: MonitorModal Headers JSON.parse Crash (HIGH)
- **Files**: `packages/dashboard/src/components/MonitorModal.tsx`
- **Fix**: Wrapped `JSON.parse(headers)` in try/catch. Shows "Invalid JSON in Headers field" error and aborts submission if parsing fails.

## BUG-014: Incident Reopening Doesn't Clear resolvedAt (HIGH)
- **Files**: `packages/server/src/services/incidentService.ts`
- **Fix**: In `addUpdate()`, changed `resolvedAt` to use `null` (not `undefined`) for non-RESOLVED statuses, and always sets it in the update (not conditionally spread). This clears `resolvedAt` when reopening an incident.

## BUG-015: Incidents Don't Sync Component Status (HIGH)
- **Files**: `packages/server/src/services/incidentService.ts`
- **Fix**: After `create()`, updates linked components' status to the incident's `componentStatus`. After `addUpdate()` with RESOLVED status, restores all linked components to OPERATIONAL.

## BUG-016: Monitor `status` Field Never Updated (HIGH)
- **Files**: `packages/server/src/monitor/processor.ts`
- **Fix**: Added `status: result.status` alongside `currentStatus` in the monitor update within `processCheckResult()`.

## BUG-017: Heartbeat Monitor Created Without heartbeatToken (HIGH)
- **Files**: `packages/server/src/services/monitorService.ts`
- **Fix**: In `create()`, auto-generates `heartbeatToken` using `crypto.randomUUID()` for HEARTBEAT type monitors.

## BUG-018: Error Responses Leak Internal Details (MEDIUM)
- **Files**: `packages/server/src/routes/auth.ts`, `packages/server/src/middleware/errorHandler.ts`
- **Fix**: Auth routes already sanitized (checked existing code). Global error handler now only includes `message` in development mode. Prisma errors mapped to generic messages.

## BUG-019: Pagination Validation Missing (MEDIUM)
- **Files**: `packages/server/src/middleware/pagination.ts` (new), routes for monitors, incidents, subscribers
- **Fix**: Created `validatePagination` middleware that validates `page >= 1` and `1 <= limit <= 100`. Applied to all list endpoints.

---

## New Files Created
1. `packages/server/src/middleware/sanitize.ts` — XSS sanitization middleware
2. `packages/server/src/middleware/pagination.ts` — Pagination validation middleware
3. `packages/server/src/lib/tokenBlacklist.ts` — In-memory token blacklist for logout

## NPM Packages Added
- `express-rate-limit` — Rate limiting for auth endpoints
- `xss` — XSS sanitization library

## Not Fixed (deferred)
- **BUG-011**: Team/member management endpoints — requires significant new code (routes, service, validation, tests). Recommend separate PR.
