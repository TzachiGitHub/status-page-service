# QA Report - Agent 2: Core CRUD Operations
**Date**: 2026-02-15
**Tester**: QA Agent 2
**Focus**: Core CRUD operations for ALL entities
**Deploy URL**: https://sp-server-production-a53a.up.railway.app

---

## BUG-1: HTTP Monitor can be created without a URL

- **Severity**: high
- **Location**: `packages/server/src/validation/monitors.ts` line 5 (`url: z.string().optional()`)
- **Steps to reproduce**:
  1. POST `/api/monitors` with `{"name":"test","type":"HTTP"}`
- **Expected**: Validation error — HTTP monitors require a URL
- **Actual**: Monitor created successfully with `url: null`
- **Evidence**:
  ```
  curl -s -X POST .../api/monitors -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"name":"test","type":"HTTP"}'
  → 201 {"data":{"id":"...","type":"HTTP","url":null,...}}
  ```

## BUG-2: HTTP Monitor accepts invalid URLs (no URL format validation)

- **Severity**: high
- **Location**: `packages/server/src/validation/monitors.ts` line 5
- **Steps to reproduce**:
  1. POST `/api/monitors` with `{"name":"bad url","type":"HTTP","url":"not-a-url"}`
- **Expected**: Validation error — URL should be a valid URL
- **Actual**: Monitor created with invalid URL `"not-a-url"`
- **Evidence**:
  ```
  curl -s -X POST .../api/monitors -d '{"name":"bad url","type":"HTTP","url":"not-a-url"}'
  → 201 {"data":{"url":"not-a-url",...}}
  ```

## BUG-3: TCP/PING/DNS/SSL monitors can be created without a target

- **Severity**: high
- **Location**: `packages/server/src/validation/monitors.ts`
- **Steps to reproduce**:
  1. POST `/api/monitors` with `{"name":"TCP test","type":"TCP"}`
- **Expected**: Validation error — TCP monitors require a target/host
- **Actual**: Monitor created with `target: null` and `url: null`
- **Evidence**:
  ```
  curl -s -X POST .../api/monitors -d '{"name":"TCP test","type":"TCP"}'
  → 201 {"data":{"type":"TCP","url":null,"target":null,...}}
  ```

## BUG-4: Component created with non-existent groupId returns 500 Internal Server Error

- **Severity**: high
- **Location**: `packages/server/src/services/componentService.ts` line 12 (`create` function)
- **Steps to reproduce**:
  1. POST `/api/components` with `{"name":"test","groupId":"00000000-0000-0000-0000-000000000000"}`
- **Expected**: 404 or 422 error with message "Component group not found"
- **Actual**: 500 Internal Server Error (unhandled Prisma foreign key constraint error)
- **Evidence**:
  ```
  curl -s -X POST .../api/components -d '{"name":"test","groupId":"00000000-0000-0000-0000-000000000000"}'
  → {"error":"Internal server error"}
  ```

## BUG-5: Incident created with non-existent componentIds returns 500 Internal Server Error

- **Severity**: high
- **Location**: `packages/server/src/services/incidentService.ts` line 30 (`create` function)
- **Steps to reproduce**:
  1. POST `/api/incidents` with `{"title":"test","message":"test","componentIds":["00000000-0000-0000-0000-000000000000"]}`
- **Expected**: 404 or 422 error with message "Component not found"
- **Actual**: 500 Internal Server Error (unhandled Prisma foreign key constraint error)
- **Evidence**:
  ```
  curl -s -X POST .../api/incidents -d '{"title":"test","message":"test","componentIds":["00000000-0000-0000-0000-000000000000"]}'
  → {"error":"Internal server error"}
  ```

## BUG-6: Filtering incidents by invalid status returns 500 Internal Server Error

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts` line 8 (`list` function)
- **Steps to reproduce**:
  1. GET `/api/incidents?status=INVALID`
- **Expected**: 400 error with message "Invalid status filter" or empty results
- **Actual**: 500 Internal Server Error (Prisma enum validation failure)
- **Evidence**:
  ```
  curl -s ".../api/incidents?status=INVALID"
  → {"error":"Internal server error"}
  ```

## BUG-7: Filtering monitors by invalid status returns 500 Internal Server Error

- **Severity**: medium
- **Location**: `packages/server/src/services/monitorService.ts` line 8 (`list` function)
- **Steps to reproduce**:
  1. GET `/api/monitors?status=BOGUS`
- **Expected**: 400 error with message "Invalid status filter" or empty results
- **Actual**: 500 Internal Server Error
- **Evidence**:
  ```
  curl -s ".../api/monitors?status=BOGUS"
  → {"error":"Internal server error"}
  ```

## BUG-8: Negative page number in pagination causes 500 Internal Server Error

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts` line 7 (pagination calc: `skip: (page - 1) * limit`)
- **Steps to reproduce**:
  1. GET `/api/incidents?page=-1`
- **Expected**: 400 error or default to page 1
- **Actual**: 500 Internal Server Error (negative skip value in Prisma)
- **Evidence**:
  ```
  curl -s ".../api/incidents?page=-1"
  → {"error":"Internal server error"}
  ```

## BUG-9: limit=0 and limit=-1 bypass pagination, returning all records

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts` lines 7-8, `monitorService.ts` lines 5-6
- **Steps to reproduce**:
  1. GET `/api/incidents?page=1&limit=0`
  2. GET `/api/incidents?page=1&limit=-1`
- **Expected**: Validation error or default to sensible limit
- **Actual**: Returns all records (limit=0 returns all via Prisma `take: 0` behavior, limit=-1 similar)
- **Evidence**:
  ```
  curl -s ".../api/incidents?page=1&limit=0" → returns all 6 incidents
  curl -s ".../api/incidents?page=1&limit=-1" → returns all incidents
  ```

## BUG-10: Subscriber confirmation token exposed in public subscribe response

- **Severity**: critical
- **Location**: `packages/server/src/services/subscriberService.ts` line 13 (`subscribe` function)
- **Steps to reproduce**:
  1. POST `/api/subscribers/acme-corp/subscribe` with `{"email":"test@example.com"}` (no auth required)
- **Expected**: Response should NOT include the confirmation token (token should only be sent via email)
- **Actual**: Response includes `token` field, allowing anyone to self-confirm without email verification
- **Evidence**:
  ```
  curl -s -X POST .../api/subscribers/acme-corp/subscribe -d '{"email":"test@example.com"}'
  → {"data":{"id":"...","token":"10f96032-01f9-45fc-a755-cdc02d788d8e",...}}
  ```
  An attacker can then call `/api/subscribers/confirm/10f96032-...` to bypass email verification.

## BUG-11: Subscriber tokens exposed in admin list endpoint

- **Severity**: high
- **Location**: `packages/server/src/services/subscriberService.ts` line 5 (`list` function)
- **Steps to reproduce**:
  1. GET `/api/subscribers` with auth
- **Expected**: Token field should be omitted or masked in list response
- **Actual**: Full unsubscribe/confirm tokens are exposed for all subscribers
- **Evidence**:
  ```
  curl -s .../api/subscribers → data includes "token":"e6c1a743-8860-49e9-bc65-..."
  ```
  Any admin can unsubscribe any user or confirm their subscription.

## BUG-12: Notification channel accepts empty config (no type-specific validation)

- **Severity**: medium
- **Location**: `packages/server/src/validation/notificationChannels.ts` line 5
- **Steps to reproduce**:
  1. POST `/api/notification-channels` with `{"name":"Bad Slack","type":"SLACK","config":{}}`
- **Expected**: Validation error — SLACK type should require `webhookUrl` in config
- **Actual**: Channel created with empty config, will fail silently when sending notifications
- **Evidence**:
  ```
  curl -s -X POST .../api/notification-channels -d '{"name":"Bad Slack","type":"SLACK","config":{}}'
  → 201 {"data":{"type":"SLACK","config":{},...}}
  ```

## BUG-13: Incident created with status RESOLVED does not set resolvedAt

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts` line 24 (`create` function)
- **Steps to reproduce**:
  1. POST `/api/incidents` with `{"title":"test","message":"test","status":"RESOLVED"}`
- **Expected**: `resolvedAt` should be set to current timestamp
- **Actual**: `resolvedAt` is null despite status being RESOLVED
- **Evidence**:
  ```
  curl -s -X POST .../api/incidents -d '{"title":"Resolve test","message":"test","status":"RESOLVED"}'
  → {"data":{"status":"RESOLVED","resolvedAt":null,...}}
  ```

## BUG-14: Duplicate component names allowed within same organization

- **Severity**: low
- **Location**: `packages/server/src/services/componentService.ts` line 12 and `prisma/schema.prisma`
- **Steps to reproduce**:
  1. POST `/api/components` with `{"name":"API"}`
  2. POST `/api/components` with `{"name":"API"}` again
- **Expected**: 409 Conflict error or validation preventing duplicate names
- **Actual**: Two components with identical name "API" created in same org
- **Evidence**:
  ```
  Both requests return 201 with different IDs but same name "API"
  ```

## BUG-15: No team/member management endpoints exist

- **Severity**: high
- **Location**: `packages/server/src/index.ts` — no member routes registered
- **Steps to reproduce**:
  1. GET `/api/members` → 404
  2. GET `/api/team` → 404
- **Expected**: CRUD endpoints for team members (list, invite, update role, remove) as per Member model in schema
- **Actual**: No member management routes exist. The Member model is in the schema but only auth routes (login/register/me) exist. No way to invite members, change roles, or remove team members.
- **Evidence**:
  ```
  curl -s .../api/members → {"error":"Not found"}
  curl -s .../api/team → {"error":"Not found"}
  ```

## BUG-16: No role-based access control on write operations

- **Severity**: high
- **Location**: All route files in `packages/server/src/routes/` (except `apiKeys.ts` which has `requireAdmin`)
- **Steps to reproduce**:
  1. Any authenticated user regardless of role (VIEWER, EDITOR, ADMIN, OWNER) can create, update, and delete components, incidents, monitors, notification channels
- **Expected**: VIEWER should be read-only; EDITOR should not delete; only ADMIN/OWNER should manage notification channels
- **Actual**: All routes only check for valid JWT (`authenticate` middleware) but never check `req.user.role`. Only `apiKeys.ts` has role checking.
- **Evidence**: No `requireRole` or role-check middleware in components, incidents, monitors, componentGroups, or notificationChannels routes.

## BUG-17: Subscriber subscribe endpoint ignores `type` field — always creates EMAIL type

- **Severity**: medium
- **Location**: `packages/server/src/services/subscriberService.ts` line 11 (`subscribe` function) and `packages/server/src/validation/subscribers.ts`
- **Steps to reproduce**:
  1. POST `/api/subscribers/acme-corp/subscribe` with `{"email":"test@example.com","type":"WEBHOOK"}`
- **Expected**: Subscriber created with type WEBHOOK, or validation error if only EMAIL is supported via public endpoint
- **Actual**: `type` field is ignored; subscriber always created as EMAIL. The validation schema doesn't include `type`, and the service only passes `email`.
- **Evidence**:
  ```
  curl -s -X POST .../api/subscribers/acme-corp/subscribe -d '{"email":"webhook@test.com","type":"WEBHOOK"}'
  → {"data":{"type":"EMAIL",...}} (type field ignored)
  ```

## BUG-18: No length/size validation on StatusPageConfig customCss field

- **Severity**: medium
- **Location**: `packages/server/src/validation/statusPage.ts` line 9
- **Steps to reproduce**:
  1. PATCH `/api/status-page/config` with `{"customCss": "<100KB+ of data>"}`
- **Expected**: Max length validation on customCss to prevent abuse
- **Actual**: Accepts arbitrarily large strings (confirmed by existing 100KB+ "aaaa" payload in DB)
- **Evidence**: The `customCss` field in the current DB contains an enormous string of repeated "a" characters with no limit enforced.

## BUG-19: Reorder components with non-existent IDs silently succeeds

- **Severity**: low
- **Location**: `packages/server/src/services/componentService.ts` line 33 (`reorder` function)
- **Steps to reproduce**:
  1. POST `/api/components/reorder` with `{"ids":["00000000-0000-0000-0000-000000000000"]}`
- **Expected**: Error indicating that one or more component IDs don't exist
- **Actual**: Returns `{"data":{"success":true}}` without actually updating anything
- **Evidence**:
  ```
  curl -s -X POST .../api/components/reorder -d '{"ids":["00000000-0000-0000-0000-000000000000"]}'
  → {"data":{"success":true}}
  ```

## BUG-20: Monitor type can be changed via PATCH without re-validating type-specific fields

- **Severity**: medium
- **Location**: `packages/server/src/validation/monitors.ts` (UpdateMonitorSchema = CreateMonitorSchema.partial())
- **Steps to reproduce**:
  1. Create HTTP monitor with URL
  2. PATCH monitor with `{"type":"TCP"}` — no target provided
- **Expected**: Validation error or automatic clearing of irrelevant fields
- **Actual**: Monitor type changed to TCP but retains HTTP-specific fields (url, method) and has no target
- **Evidence**:
  ```
  curl -s -X PATCH .../api/monitors/$ID -d '{"type":"TCP"}'
  → {"data":{"type":"TCP","url":"https://example.com","target":null,...}}
  ```

## BUG-21: Component update allows orgId field injection via spread operator

- **Severity**: medium
- **Location**: `packages/server/src/services/componentService.ts` line 18 — `prisma.component.update({ where: { id }, data })`
- **Steps to reproduce**:
  1. PATCH `/api/components/:id` with `{"orgId":"00000000-0000-0000-0000-000000000000"}`
- **Expected**: `orgId` should be stripped from update data / validation should reject it
- **Actual**: The `UpdateComponentSchema` is `CreateComponentSchema.partial()` which doesn't include `orgId`, so Zod strips it. However, if Zod passthrough mode were enabled, this would be exploitable. Currently safe by accident, not by design. Same pattern exists across all services (spreading `data` directly into Prisma update). 
- **Note**: Downgrading to low since Zod's default strip mode protects against this, but the pattern is fragile.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 1     |
| High     | 6     |
| Medium   | 8     |
| Low      | 2     |
| **Total**| **17** |

### Critical Issues
- **BUG-10**: Subscriber token exposed in public response → bypass email verification

### High Priority
- **BUG-1, 2, 3**: Missing monitor type-specific validation (URL/target)
- **BUG-4, 5**: Foreign key violations return 500 instead of proper errors
- **BUG-15**: No team/member management endpoints
- **BUG-16**: No role-based access control on CRUD operations

### Patterns Observed
1. **Missing contextual validation**: Validation schemas are flat and don't enforce type-specific requirements (e.g., HTTP needs URL, TCP needs target, SLACK needs webhookUrl in config)
2. **No query parameter validation**: Filter/pagination params from query strings are never validated, causing Prisma errors
3. **Foreign key errors not caught**: Non-existent references (groupId, componentIds) bubble up as 500 errors
4. **Security by accident**: Token exposure and missing RBAC suggest security wasn't a primary design consideration
