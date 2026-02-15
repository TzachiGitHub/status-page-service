# QA Agent 4 — API Error Handling, Edge Cases & Validation

**Tester**: QA Agent 4
**Date**: 2026-02-15
**Focus**: API endpoints — error handling, edge cases, and validation
**Deploy URL**: https://sp-server-production-a53a.up.railway.app

---

## BUG-1: XSS payloads stored unsanitized in all string fields

- **Severity**: high
- **Location**: `packages/server/src/services/componentService.ts` (line 9, `create`), `packages/server/src/services/incidentService.ts` (line 30, `create`), `packages/server/src/routes/auth.ts` (line 32, register handler) — affects ALL create/update endpoints
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/components \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"name":"<script>alert(1)</script>","description":"<img src=x onerror=alert(1)>"}'
  ```
- **Expected**: XSS payloads should be sanitized/escaped before storage, or at minimum rejected by validation
- **Actual**: XSS payloads stored verbatim in database and returned in API responses. Affects: component name/description, incident title/message, monitor name, org name, user name, notification channel config, status page customCss
- **Evidence**: `{"data":{"name":"<script>alert(1)</script>","description":"<img src=x onerror=alert(1)>"}}`

---

## BUG-2: Negative page number causes 500 Internal Server Error (Prisma crash)

- **Severity**: high
- **Location**: `packages/server/src/services/incidentService.ts` (line 11), `packages/server/src/services/monitorService.ts` (line 8), `packages/server/src/services/subscriberService.ts` — all services using `skip: (page - 1) * limit`
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/incidents?page=-1 \
    -H "Authorization: Bearer <token>"
  ```
- **Expected**: 400 error with validation message, or clamp to page 1
- **Actual**: 500 Internal Server Error — Prisma crashes on negative `skip` value
- **Evidence**: `{"error":"Internal server error"}` HTTP 500. Same for `/api/monitors?page=-1`, `/api/subscribers?page=-1`, `/api/monitors/<id>/checks?page=-1`

---

## BUG-3: Invalid status/type filter causes 500 Internal Server Error (Prisma enum error)

- **Severity**: high
- **Location**: `packages/server/src/services/incidentService.ts` (line 10), `packages/server/src/services/monitorService.ts` (lines 7-8)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/incidents?status=INVALID_STATUS \
    -H "Authorization: Bearer <token>"
  
  curl -s https://sp-server-production-a53a.up.railway.app/api/monitors?status=BOGUS \
    -H "Authorization: Bearer <token>"
  
  curl -s https://sp-server-production-a53a.up.railway.app/api/monitors?type=BOGUS \
    -H "Authorization: Bearer <token>"
  ```
- **Expected**: 400 error with message about invalid status/type values
- **Actual**: 500 Internal Server Error — Prisma rejects invalid enum values
- **Evidence**: `{"error":"Internal server error"}` HTTP 500

---

## BUG-4: Duplicate org slug on registration leaks Prisma error details

- **Severity**: high
- **Location**: `packages/server/src/routes/auth.ts` (line 34, register handler)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"orgName":"Acme Corp","name":"Dup","email":"dup@test.com","password":"password123"}'
  ```
- **Expected**: User-friendly error like "Organization name already taken" (409)
- **Actual**: 500 error leaking Prisma internals: `"message":"Invalid \`prisma.organization.create()\` invocation: Unique constraint failed on the fields: (\`slug\`)"`
- **Evidence**: `{"error":"Registration failed","message":"\nInvalid \`prisma.organization.create()\` invocation:\n\n\nUnique constraint failed on the fields: (\`slug\`)"}`

---

## BUG-5: Negative limit accepted, returns all records (Prisma behavior)

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts` (line 12), `packages/server/src/services/monitorService.ts` (line 10)
- **Steps to reproduce**:
  ```bash
  curl -s "https://sp-server-production-a53a.up.railway.app/api/incidents?page=1&limit=-5" \
    -H "Authorization: Bearer <token>"
  ```
- **Expected**: 400 validation error, or clamp to minimum of 1
- **Actual**: Returns all records. Meta shows `"limit":-5`
- **Evidence**: `{"data":[...all incidents...],"meta":{"total":3,"page":1,"limit":-5}}`

---

## BUG-6: No upper bound on pagination limit — potential DoS vector

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts` (line 12), `packages/server/src/services/monitorService.ts` (line 10)
- **Steps to reproduce**:
  ```bash
  curl -s "https://sp-server-production-a53a.up.railway.app/api/incidents?limit=999999" \
    -H "Authorization: Bearer <token>"
  ```
- **Expected**: Limit capped at a reasonable maximum (e.g., 100)
- **Actual**: Prisma `take: 999999` accepted — could dump entire table and cause memory/performance issues
- **Evidence**: `{"data":[...],"meta":{"total":3,"page":1,"limit":999999}}`

---

## BUG-7: page=0 treated as page=1 silently (off-by-one)

- **Severity**: low
- **Location**: `packages/server/src/services/incidentService.ts` (line 9: `const page = filters.page || 1`)
- **Steps to reproduce**:
  ```bash
  curl -s "https://sp-server-production-a53a.up.railway.app/api/incidents?page=0" \
    -H "Authorization: Bearer <token>"
  ```
- **Expected**: 400 error (page must be >= 1) or explicitly documented behavior
- **Actual**: `page || 1` converts 0 to 1 silently. Reports `"page":1` in meta despite `page=0` being sent
- **Evidence**: Response `meta` shows `"page":1`

---

## BUG-8: Negative order accepted for components

- **Severity**: low
- **Location**: `packages/server/src/validation/components.ts` (line 6: `order: z.number().int().optional()`)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/components \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"name":"test","order":-999}'
  ```
- **Expected**: Validation rejects negative order values
- **Actual**: Component created with `order: -999`
- **Evidence**: `{"data":{"name":"test","order":-999,...}}`

---

## BUG-9: NaN in query params causes 500 Internal Server Error

- **Severity**: medium
- **Location**: `packages/server/src/routes/components.ts` (line 38: `const days = req.query.days ? Number(req.query.days) : 30`)
- **Steps to reproduce**:
  ```bash
  curl -s "https://sp-server-production-a53a.up.railway.app/api/components/<id>/history?days=abc" \
    -H "Authorization: Bearer <token>"
  ```
- **Expected**: 400 error: "days must be a number"
- **Actual**: 500 Internal Server Error — `Number("abc")` produces `NaN`, which propagates to date calculation
- **Evidence**: `{"error":"Internal server error"}` HTTP 500

---

## BUG-10: Public uptime endpoint crashes with very large days parameter

- **Severity**: medium
- **Location**: `packages/server/src/services/statusPageService.ts` (line 63: `const since = new Date(Date.now() - days * 86400000)`)
- **Steps to reproduce**:
  ```bash
  curl -s "https://sp-server-production-a53a.up.railway.app/api/public/acme-corp/uptime?days=999999999"
  ```
- **Expected**: Clamp days to reasonable max or return 400
- **Actual**: 500 Internal Server Error — likely integer overflow or invalid date
- **Evidence**: `{"error":"Internal server error"}` HTTP 500

---

## BUG-11: Creating incident with non-existent componentIds causes 500

- **Severity**: medium
- **Location**: `packages/server/src/services/incidentService.ts` (line 30, `create` function)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/incidents \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"title":"Test","message":"test","componentIds":["00000000-0000-0000-0000-000000000000"]}'
  ```
- **Expected**: 400 or 404 error: "Component not found"
- **Actual**: 500 Internal Server Error — Prisma foreign key constraint failure
- **Evidence**: `{"error":"Internal server error"}` HTTP 500

---

## BUG-12: API key can be created with past expiration date

- **Severity**: medium
- **Location**: `packages/server/src/validation/apiKeys.ts` (line 4)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/api-keys \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"name":"expired-key","expiresAt":"2020-01-01T00:00:00Z"}'
  ```
- **Expected**: Validation rejects past dates
- **Actual**: API key created with `expiresAt: "2020-01-01T00:00:00.000Z"` — already expired at creation
- **Evidence**: `{"data":{"name":"expired-key","expiresAt":"2020-01-01T00:00:00.000Z",...}}`

---

## BUG-13: Notification channel accepts javascript: URLs in webhook config

- **Severity**: high
- **Location**: `packages/server/src/validation/notificationChannels.ts` (line 5: `config: z.record(z.string(), z.unknown())`)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/notification-channels \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"name":"test","type":"WEBHOOK","config":{"url":"javascript:alert(1)"}}'
  ```
- **Expected**: Webhook URL validated to be http/https only
- **Actual**: Any value accepted in config, including `javascript:` URLs and arbitrary data. No schema validation for channel-specific config (SLACK needs webhookUrl, EMAIL needs addresses, etc.)
- **Evidence**: `{"data":{"type":"WEBHOOK","config":{"url":"javascript:alert(1)"},...}}`

---

## BUG-14: No size limit on customCss field — can store 100KB+ of data

- **Severity**: medium
- **Location**: `packages/server/src/validation/statusPage.ts` (line 7: `customCss: z.string().optional().nullable()`)
- **Steps to reproduce**:
  ```bash
  curl -s -X PATCH https://sp-server-production-a53a.up.railway.app/api/status-page/config \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"customCss":"<100000 chars>"}'
  ```
- **Expected**: customCss limited to reasonable size (e.g., 50KB)
- **Actual**: 100,000 character string accepted and stored
- **Evidence**: Full 100KB response returned successfully with HTTP 200

---

## BUG-15: Unsupported HTTP methods return HTML error page instead of JSON

- **Severity**: medium
- **Location**: Express default 404 handler (not overridden in app setup)
- **Steps to reproduce**:
  ```bash
  curl -s -X PUT https://sp-server-production-a53a.up.railway.app/api/components/<id> \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"name":"test"}'
  ```
- **Expected**: JSON error response: `{"error":"Method not allowed"}` with 405 status
- **Actual**: HTML error page: `<pre>Cannot PUT /api/components/...</pre>` with 404 status and `text/html` Content-Type
- **Evidence**: `<!DOCTYPE html><html><body><pre>Cannot PUT /api/components/...</pre></body></html>`

---

## BUG-16: Auth error responses leak internal error messages in production

- **Severity**: medium
- **Location**: `packages/server/src/routes/auth.ts` (lines 44, 67, 81)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"orgName":"Acme Corp","name":"Dup","email":"dup@test.com","password":"password123"}'
  ```
- **Expected**: Generic error without internal details
- **Actual**: `(err as Error).message` is always included in auth responses regardless of NODE_ENV. The error handler middleware checks `process.env.NODE_ENV === 'development'` but auth routes have their own try/catch that always includes `message`.
- **Evidence**: `{"error":"Registration failed","message":"\nInvalid \`prisma.organization.create()\` invocation:\n\n\nUnique constraint failed on the fields: (\`slug\`)"}`

---

## BUG-17: CORS allows all origins (`*`) — should be restricted in production

- **Severity**: medium
- **Location**: Server CORS configuration (likely `packages/server/src/index.ts` or `app.ts`)
- **Steps to reproduce**:
  ```bash
  curl -s -D- -o/dev/null https://sp-server-production-a53a.up.railway.app/api/public/acme-corp/status \
    -H "Origin: http://evil.com" 2>&1 | grep access-control
  ```
- **Expected**: CORS restricted to known frontend domains
- **Actual**: `access-control-allow-origin: *` returned for any origin
- **Evidence**: `access-control-allow-origin: *`

---

## BUG-18: Notification channel created with empty config object

- **Severity**: low
- **Location**: `packages/server/src/validation/notificationChannels.ts` (line 5)
- **Steps to reproduce**:
  ```bash
  curl -s https://sp-server-production-a53a.up.railway.app/api/notification-channels \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"name":"test","type":"SLACK","config":{}}'
  ```
- **Expected**: Validation requires type-specific config fields (e.g., SLACK needs webhookUrl)
- **Actual**: Empty config accepted for all channel types
- **Evidence**: `{"data":{"type":"SLACK","config":{},...}}`

---

## BUG-19: Public uptime accepts negative days parameter

- **Severity**: low
- **Location**: `packages/server/src/services/statusPageService.ts` (line 60)
- **Steps to reproduce**:
  ```bash
  curl -s "https://sp-server-production-a53a.up.railway.app/api/public/acme-corp/uptime?days=-10"
  ```
- **Expected**: 400 error or clamp to minimum of 1
- **Actual**: Returns 200 with `uptime: 100` for all components (since date is in the future, no checks match)
- **Evidence**: `{"data":[{"componentId":"...","uptime":100},...]}`

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 4 |
| Medium | 8 |
| Low | 4 |
| **Total** | **16** (BUG-1 through BUG-19, with BUG-2 covering multiple endpoints) |

### Top Issues to Fix First:
1. **BUG-4/BUG-16**: Prisma error leaking in auth responses — exposes internal DB structure
2. **BUG-1**: XSS stored unsanitized — high risk when rendered in frontend
3. **BUG-2/BUG-3**: Negative page and invalid enum filters crash the server — easy DoS
4. **BUG-13**: Webhook config has zero validation — SSRF and injection risk

### Positive Findings:
- ✅ Cross-org access properly blocked (org isolation works correctly)
- ✅ SQL injection not possible (Prisma parameterized queries)
- ✅ JWT auth works correctly (rejects invalid/tampered tokens)
- ✅ Zod validation catches most malformed inputs
- ✅ Error handler doesn't leak stack traces in production (except auth routes)
- ✅ Content-Type properly set to `application/json` on all JSON responses
