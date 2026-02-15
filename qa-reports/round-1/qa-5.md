# QA-5 Report: Data Integrity, Monitors, and Public Status Page

**Agent**: QA Agent 5  
**Date**: 2026-02-15  
**Focus**: Data integrity, monitors, public status page  

---

## BUG-1: Incident reopening does not clear resolvedAt timestamp

- **Severity**: high
- **Location**: `packages/server/src/services/incidentService.ts`, `addUpdate()` function (~line 50)
- **Steps to reproduce**:
  1. Create an incident
  2. Progress it through INVESTIGATING → IDENTIFIED → MONITORING → RESOLVED
  3. Add a new update with status INVESTIGATING (reopen)
  4. Fetch the incident
- **Expected**: `resolvedAt` should be set to `null` when incident is reopened (status changed away from RESOLVED)
- **Actual**: `resolvedAt` retains the old timestamp (`2026-02-15T07:09:25.307Z`) while status is `INVESTIGATING`
- **Evidence**:
  ```
  status=INVESTIGATING, resolvedAt=2026-02-15T07:09:25.307Z
  ```
  The `addUpdate` function only sets `resolvedAt` when status is RESOLVED, but never clears it on reopen:
  ```typescript
  const resolvedAt = data.status === 'RESOLVED' ? new Date() : undefined;
  ```
  Should be:
  ```typescript
  const resolvedAt = data.status === 'RESOLVED' ? new Date() : (data.status !== 'RESOLVED' ? null : undefined);
  ```

---

## BUG-2: Creating an incident does not update linked component status

- **Severity**: high
- **Location**: `packages/server/src/services/incidentService.ts`, `create()` function
- **Steps to reproduce**:
  1. Note component "API" status is OPERATIONAL
  2. Create incident with `componentIds: ["cf51fc3d-..."]` and `componentStatus: "MAJOR_OUTAGE"`
  3. Fetch the component
- **Expected**: Component status should be updated to MAJOR_OUTAGE (or at least DEGRADED_PERFORMANCE)
- **Actual**: Component status remains OPERATIONAL. The `IncidentComponent` junction record stores the status, but the actual `Component.status` field is never updated
- **Evidence**:
  ```
  Before: OPERATIONAL
  After creating MAJOR_OUTAGE incident: OPERATIONAL
  ```

---

## BUG-3: Resolving an incident does not restore component status

- **Severity**: high
- **Location**: `packages/server/src/services/incidentService.ts`, `addUpdate()` function
- **Steps to reproduce**:
  1. Create incident linked to a component with MAJOR_OUTAGE
  2. Resolve the incident
  3. Fetch the component
- **Expected**: Component status should revert to OPERATIONAL when all linked incidents are resolved
- **Actual**: Component status is unchanged (stays whatever it was)
- **Evidence**:
  ```
  After resolving incident: OPERATIONAL
  ```
  Note: This is only "fine" because BUG-2 means the status was never changed in the first place. If BUG-2 is fixed, this becomes critical — components would get stuck in MAJOR_OUTAGE forever.

---

## BUG-4: Monitor `status` field never updated — only `currentStatus` is written

- **Severity**: high
- **Location**: `packages/server/src/monitor/processor.ts`, line ~52
- **Steps to reproduce**:
  1. Create an HTTP monitor
  2. Wait for scheduler to run a check
  3. Fetch the monitor
- **Expected**: Both `status` and `currentStatus` should reflect the check result
- **Actual**: `processCheckResult` only updates `currentStatus`, never updates `status`. The `status` enum field remains `UNKNOWN` forever.
- **Evidence**:
  ```typescript
  // processor.ts line ~52
  await prisma.monitor.update({
    where: { id: monitorId },
    data: {
      currentStatus: result.status,  // ← only this is updated
      lastCheckedAt: new Date(),
    },
  });
  ```
  The `status` field (MonitorStatus enum) is never written. This means any query filtering by `status` (e.g., `GET /api/monitors?status=UP`) will never return results.

---

## BUG-5: Heartbeat monitor created without `heartbeatToken`

- **Severity**: high
- **Location**: `packages/server/src/services/monitorService.ts`, `create()` function
- **Steps to reproduce**:
  1. Create a monitor with `type: "HEARTBEAT"`
  2. Fetch the monitor
- **Expected**: A unique `heartbeatToken` should be auto-generated so external services can ping it
- **Actual**: `heartbeatToken` is `null`. Without a token, the heartbeat endpoint cannot identify this monitor.
- **Evidence**:
  ```
  type=HEARTBEAT, heartbeatToken=None
  ```

---

## BUG-6: Subscriber token exposed in subscribe API response

- **Severity**: high
- **Location**: `packages/server/src/services/subscriberService.ts`, `subscribe()` function
- **Steps to reproduce**:
  1. POST to `/api/subscribers/acme-corp/subscribe` with an email
  2. Observe the response
- **Expected**: Token should NOT be returned in the response — it should only be sent via confirmation email
- **Actual**: The full `token` is returned in the JSON response, allowing anyone to confirm or unsubscribe any subscriber without email access
- **Evidence**:
  ```json
  {"data":{"id":"...","token":"81905b31-9db2-48b2-a6b6-75f79de7230a",...}}
  ```
  This is a security issue: an attacker can subscribe any email and immediately confirm it without owning the email.

---

## BUG-7: Subscriber tokens exposed in admin list endpoint

- **Severity**: medium
- **Location**: `packages/server/src/services/subscriberService.ts`, `list()` function
- **Steps to reproduce**:
  1. GET `/api/subscribers` with admin auth
  2. Observe tokens in response
- **Expected**: Tokens should be excluded from the admin list (or at least redacted). Admins don't need unsubscribe tokens.
- **Actual**: Full tokens are returned for every subscriber
- **Evidence**:
  ```
  id=05801f5e-..., token=10f96032-..., email=qa-test@example.com
  ```

---

## BUG-8: Incident service does not call notification hooks

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts`
- **Steps to reproduce**:
  1. Create an incident
  2. Check if `onIncidentChange` hook from `notifications/hooks.ts` is called
- **Expected**: Incident creation and updates should trigger SSE events and subscriber notifications
- **Actual**: The `incidentService` never imports or calls `onIncidentChange`. No SSE broadcast or notification dispatch occurs on incident CRUD operations.
- **Evidence**: `grep -n "onIncidentChange\|hooks" incidentService.ts` returns nothing.

---

## BUG-9: No maintenance window model — `createScheduledMaintenance` is just a regular incident

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts`, `createScheduledMaintenance()` function (last function)
- **Steps to reproduce**:
  1. Call `createScheduledMaintenance`
  2. Inspect what it creates
- **Expected**: Maintenance windows should have start/end times, scheduled status, and distinct handling
- **Actual**: It just creates a regular incident with status=MONITORING and severity=MINOR. No `scheduledAt`, `scheduledUntil` fields. No way to create overlapping or future maintenance windows. No distinction from regular incidents on the public page.
- **Evidence**:
  ```typescript
  export async function createScheduledMaintenance(data, orgId) {
    return create({ ...data, status: 'MONITORING', severity: 'MINOR' }, orgId);
  }
  ```

---

## BUG-10: Public status page shows all components including test/orphaned data

- **Severity**: medium
- **Location**: `packages/server/src/services/statusPageService.ts`, `getPublicStatus()` function
- **Steps to reproduce**:
  1. Create test components (ungrouped, with weird names)
  2. Visit the public status page API
- **Expected**: Public status page should only show curated components (e.g., those in groups, or explicitly marked as visible)
- **Actual**: All components are shown including test components, ungrouped components, and even XSS payloads from other QA agents
- **Evidence**:
  ```
  test-neg-order (group=ungrouped)
  Test Comp QA5 (group=ungrouped)
  <script>alert(1)</script> (group=ungrouped)
  ```

---

## BUG-11: Monitor scheduler fetches ALL enabled monitors every tick, ignoring interval filtering at DB level

- **Severity**: medium
- **Location**: `packages/server/src/monitor/scheduler.ts`, `tick()` method (~line 40)
- **Steps to reproduce**:
  1. Have 1000 monitors with `interval: 3600` (1 hour)
  2. Scheduler ticks every 10 seconds
  3. Every tick loads ALL enabled monitors from DB
- **Expected**: DB query should filter out monitors not due for checking
- **Actual**: The `OR` clause in the Prisma query is incomplete (empty second condition), so ALL enabled monitors are loaded. Filtering happens in JS afterward, which is wasteful at scale.
- **Evidence**:
  ```typescript
  const monitors = await this.prisma.monitor.findMany({
    where: {
      enabled: true,
      OR: [
        { lastCheckedAt: null },
        {
          // Due: lastCheckedAt + interval < now
          // We compute this with raw filter  ← EMPTY CONDITION
        },
      ],
    },
  });
  ```
  The second OR branch is an empty object `{}`, which matches ALL records. The `OR` is effectively useless.

---

## BUG-12: Monitor `status` field queryable but always UNKNOWN

- **Severity**: medium
- **Location**: `packages/server/src/services/monitorService.ts`, `list()` + `packages/server/src/monitor/processor.ts`
- **Steps to reproduce**:
  1. GET `/api/monitors?status=UP`
  2. Observe results
- **Expected**: Should return monitors that are currently UP
- **Actual**: Returns empty because `status` field is never updated (see BUG-4). The `@@index([status])` in schema is wasted.
- **Evidence**: Related to BUG-4. The `list()` function filters on `status` but processor only writes `currentStatus`.

---

## BUG-13: Public uptime returns 100% for components with no monitors

- **Severity**: low
- **Location**: `packages/server/src/services/statusPageService.ts`, `getPublicUptime()` function
- **Steps to reproduce**:
  1. Have components with no linked monitors
  2. Call `/api/public/acme-corp/uptime`
- **Expected**: Should indicate "no data" or be excluded
- **Actual**: Returns `uptime: 100` which is misleading — there's no monitoring data to support this claim
- **Evidence**:
  ```typescript
  if (monitors.length === 0) return { componentId: component.id, name: component.name, uptime: 100 };
  ```

---

## BUG-14: Alert record has no foreign key to Incident

- **Severity**: low
- **Location**: `packages/server/prisma/schema.prisma`, Alert model
- **Steps to reproduce**:
  1. Examine the Alert model schema
- **Expected**: `incidentId` should have a relation to the Incident model with proper FK constraint
- **Actual**: `incidentId` is a plain optional String with no `@relation`. Orphaned `incidentId` values can point to deleted incidents with no referential integrity.
- **Evidence**:
  ```prisma
  model Alert {
    incidentId   String?    // ← no @relation to Incident
    // ...
  }
  ```

---

## BUG-15: Double-subscribe returns existing subscriber with token (information leak)

- **Severity**: medium
- **Location**: `packages/server/src/services/subscriberService.ts`, `subscribe()` function
- **Steps to reproduce**:
  1. Subscribe with email `test@example.com`
  2. Subscribe again with same email
- **Expected**: Should return a generic "subscription exists" message without revealing the existing token
- **Actual**: Returns the full existing subscriber record including the token, allowing an attacker to take over someone else's subscription
- **Evidence**:
  ```typescript
  const existing = await prisma.subscriber.findFirst({ where: { email, orgId } });
  if (existing) return { data: existing };  // ← returns full record with token
  ```

---

## Summary

| # | Bug | Severity |
|---|-----|----------|
| 1 | resolvedAt not cleared on incident reopen | high |
| 2 | Incident creation doesn't update component status | high |
| 3 | Incident resolution doesn't restore component status | high |
| 4 | Monitor `status` field never updated (only `currentStatus`) | high |
| 5 | Heartbeat monitor missing auto-generated token | high |
| 6 | Subscriber token exposed in subscribe response | high |
| 7 | Subscriber tokens exposed in admin list | medium |
| 8 | Incident service doesn't call notification hooks | medium |
| 9 | No real maintenance window model | medium |
| 10 | Public page shows all components (no visibility filter) | medium |
| 11 | Scheduler loads all monitors every tick (empty OR clause) | medium |
| 12 | Monitor status filter broken (queries wrong field) | medium |
| 13 | 100% uptime reported for unmonitored components | low |
| 14 | Alert.incidentId has no FK constraint | low |
| 15 | Double-subscribe leaks existing subscriber token | medium |

**Total: 15 bugs** (6 high, 7 medium, 2 low)
