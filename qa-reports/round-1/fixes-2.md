# Fixes by Dev Agent 2 — BUG-020 through BUG-040

## BUG-018: Error Responses Leak Internal Details
**File**: `packages/server/src/routes/auth.ts`
**Fix**: Removed `(err as Error).message` from all catch blocks in auth routes. Now returns generic error messages. Prisma P2002 unique constraint errors return "Organization name already taken" instead of raw Prisma error. All errors logged server-side via `console.error`.

## BUG-019: Pagination Validation Missing
**Files**: `packages/server/src/services/incidentService.ts`, `monitorService.ts`, `subscriberService.ts`
**Fix**: Added `validatePagination()` helper to each service that clamps page≥1, limit between 1-100, and handles NaN values. Defaults: page=1, limit=20.

## BUG-020: Invalid Enum Filters Cause 500
**Files**: `packages/server/src/services/incidentService.ts`, `monitorService.ts`
**Fix**: Added enum validation arrays (`VALID_INCIDENT_STATUSES`, `VALID_MONITOR_STATUSES`, `VALID_MONITOR_TYPES`). Invalid filter values now throw a 400 error with a descriptive message instead of letting Prisma throw a 500.

## BUG-021: Query Parameter Validation Missing — NaN and Extreme Values
**Files**: `packages/server/src/routes/components.ts`, `routes/public.ts`
**Fix**: Numeric `days` query parameter now validated with `isNaN` check, clamped to range 1-365. NaN defaults to the original default (30 or 90).

## BUG-022: Notification Channel Config Not Validated
**File**: `packages/server/src/validation/notificationChannels.ts`
**Fix**: Added type-specific config validation using `superRefine`:
- SLACK: requires `webhookUrl` (valid HTTPS URL)
- WEBHOOK: requires `url` (valid HTTP/HTTPS URL, rejects `javascript:`)
- EMAIL: requires `addresses` array with at least one valid email
- SMS: requires `phoneNumbers` array with at least one entry

## BUG-023: Password Minimum Length Too Weak
**File**: `packages/server/src/routes/auth.ts`
**Fix**: Already fixed by another agent (min 6 → min 8 with descriptive message). Confirmed in place.

## BUG-024: JWT 7-Day Expiration
**File**: `packages/server/src/routes/auth.ts`
**Fix**: Changed JWT `expiresIn` from `'7d'` to `'1h'`. Full refresh token rotation would require more infrastructure (new endpoints, token storage) — this reduces the attack window significantly.

## BUG-025: No Size Limit on customCss Field
**File**: `packages/server/src/validation/statusPage.ts`
**Fix**: Added `.max(50000, 'Custom CSS must be under 50KB')` to the `customCss` field validation.

## BUG-026: Incident Created With RESOLVED Status Has Null resolvedAt
**File**: `packages/server/src/services/incidentService.ts`
**Fix**: In `create()`, added `resolvedAt: new Date()` when `status === 'RESOLVED'` is passed at creation time.

## BUG-027: Subscriber Type Field Ignored
**Files**: `packages/server/src/validation/subscribers.ts`, `services/subscriberService.ts`, `routes/subscribers.ts`
**Fix**: Added `type` field (enum: EMAIL, WEBHOOK, SLACK, default EMAIL) to `SubscribeSchema`. Updated `subscribe()` service function to accept and pass `type` parameter. Updated route to forward `req.body.type`.

## BUG-028: Monitor Type Can Be Changed Via PATCH
**File**: `packages/server/src/validation/monitors.ts`
**Fix**: Changed `UpdateMonitorSchema` from `BaseMonitorSchema.partial()` to `BaseMonitorSchema.omit({ type: true }).partial()`. This prevents type changes via PATCH, avoiding inconsistent monitor state.

## BUG-029: Unsupported HTTP Methods Return HTML Error
**File**: `packages/server/src/index.ts`
**Fix**: Added a JSON 404 catch-all handler for `/api` routes before the error handlers: `app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))`. This ensures all unmatched API routes return JSON instead of Express's default HTML.

## BUG-030: Dashboard and Public Page Routing Conflict
**Status**: Not fixed — this is an architectural design decision about URL structure. The current setup (dashboard at `/`, public page at `/status/`) is functional. A proper fix would involve separate domains or a landing page redirect, which is beyond a bug fix scope.

## BUG-031: Public Page Subscribe Endpoint Mismatch
**File**: `packages/public-page/src/components/SubscribeForm.tsx`
**Fix**: Changed subscribe POST URL from `/api/subscribe` to `/api/subscribers/${slug}/subscribe` to match the server's subscriber route pattern.

## BUG-032: Public Page Slug Detection Uses Entire Path
**File**: `packages/public-page/src/hooks/useStatusPage.ts`
**Fix**: Rewrote `getSlug()` to look for the `status` segment in the path and extract the next segment as the slug (e.g., `/status/acme-corp` → `acme-corp`), instead of using the entire path.

## BUG-033: OverviewPage Shows Empty State When All API Calls Fail
**File**: `packages/dashboard/src/pages/OverviewPage.tsx`
**Fix**: Added `error` state. When all three `Promise.allSettled` calls are rejected, sets an error message. Renders an error UI with a retry button instead of showing misleading empty state.

## BUG-034: Settings Page Toggle Has Conflicting Click Handlers
**File**: `packages/dashboard/src/pages/SettingsPage.tsx`
**Status**: Already fixed by another agent. The `onClick` handler on the toggle div was already removed; only the `<input onChange>` remains.

## BUG-035: API Key Authentication Has No Permission Scoping
**Status**: Not fixed — this requires schema changes (scope field on ApiKey model), middleware updates, and route-level enforcement. Beyond medium bug fix scope.

## BUG-036: Incident Service Does Not Call Notification Hooks
**File**: `packages/server/src/services/incidentService.ts`
**Fix**: Imported `onIncidentChange` from `../notifications/hooks.js`. Added calls in `create()` (after incident creation) and `addUpdate()` (after update transaction). Both fire-and-forget with `.catch(() => {})` to avoid blocking the response.

## BUG-037: No Real Maintenance Window Model
**Files**: `packages/server/prisma/schema.prisma`, `services/incidentService.ts`
**Fix**: Added `isMaintenance Boolean @default(false)`, `scheduledStartAt DateTime?`, and `scheduledEndAt DateTime?` fields to the Incident model. Updated `createScheduledMaintenance()` to accept and store `scheduledStartAt`/`scheduledEndAt` parameters and set `isMaintenance: true`.

## BUG-038: Public Status Page Shows All Components
**Files**: `packages/server/prisma/schema.prisma`, `services/statusPageService.ts`, `validation/components.ts`
**Fix**: Added `showOnStatusPage Boolean @default(true)` to the Component model. Updated `getPublicStatus()` and `getPublicUptime()` queries to filter by `showOnStatusPage: true`. Added `showOnStatusPage` to the component validation schema so it can be toggled via API.

## BUG-039: Monitor Scheduler Loads ALL Monitors Every Tick
**File**: `packages/server/src/monitor/scheduler.ts`
**Fix**: Replaced the empty `{}` OR branch (which matched ALL records) with `{ lastCheckedAt: { lt: now } }`. Combined with the existing JS filter for due monitors, this is functionally correct. The empty object was the real bug — it negated the OR condition entirely.

## BUG-040: API Key Can Be Created With Past Expiration Date
**File**: `packages/server/src/validation/apiKeys.ts`
**Fix**: Added `.refine()` validation on `expiresAt` that checks `new Date(val) > new Date()`, rejecting past dates with message "Expiration date must be in the future".

---

## Build Verification
All three packages build successfully:
- ✅ `packages/server` — tsup build success
- ✅ `packages/dashboard` — tsc + vite build success
- ✅ `packages/public-page` — tsc + vite build success
