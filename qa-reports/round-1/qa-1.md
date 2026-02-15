# QA Report — Authentication & Authorization
**Agent**: QA-1  
**Date**: 2026-02-15  
**Target**: https://sp-server-production-a53a.up.railway.app  
**Focus**: Auth flows, JWT, middleware, access control

---

## BUG-1: Hardcoded JWT Secret Fallback Allows Token Forgery

- **Severity**: critical
- **Location**: `packages/server/src/routes/auth.ts` line 24, `packages/server/src/middleware/auth.ts` line 25
- **Steps to reproduce**:
  1. Observe `process.env.JWT_SECRET || 'secret'` in both `signToken()` and `authenticate()`
  2. If `JWT_SECRET` env var is unset or empty, the literal string `'secret'` is used
  3. Attacker signs a forged JWT with `jwt.sign({userId:'x',orgId:'y',role:'OWNER'}, 'secret')` and gains full access
- **Expected**: Server should refuse to start if `JWT_SECRET` is not set, or use a cryptographically random default
- **Actual**: Falls back to the guessable string `'secret'`, allowing trivial token forgery
- **Evidence**: `jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });`

---

## BUG-2: No Rate Limiting on Login Endpoint — Brute Force Possible

- **Severity**: high
- **Location**: `packages/server/src/routes/auth.ts` (login route), `packages/server/src/index.ts` line 37
- **Steps to reproduce**:
  1. Send 10+ rapid `POST /api/auth/login` requests with wrong passwords
  2. Observe all return 401 with no throttling or lockout
  3. `for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code} " ...; done` → `401 401 401 401 401 401 401 401 401 401`
- **Expected**: After N failed attempts, IP should be rate-limited or account temporarily locked
- **Actual**: Unlimited login attempts allowed, enabling brute force attacks
- **Evidence**: All 10 rapid requests returned 401 with no 429 or delay

---

## BUG-3: No Server-Side Logout / Token Revocation

- **Severity**: high
- **Location**: `packages/server/src/routes/auth.ts` (missing endpoint), `packages/dashboard/src/stores/authStore.ts` line 18
- **Steps to reproduce**:
  1. Login and obtain a JWT token
  2. Call `POST /api/auth/logout` → returns `Cannot POST /api/auth/logout`
  3. Dashboard logout only does `localStorage.removeItem('token')` client-side
  4. The old token remains valid for up to 7 days
- **Expected**: Server-side logout endpoint that invalidates/blacklists the token
- **Actual**: No logout endpoint exists; tokens cannot be revoked once issued
- **Evidence**: `curl -X POST .../api/auth/logout` → `Cannot POST /api/auth/logout`

---

## BUG-4: CORS Allows All Origins — Credential Theft via CSRF

- **Severity**: high
- **Location**: `packages/server/src/index.ts` line 23
- **Steps to reproduce**:
  1. Observe `app.use(cors())` with no configuration
  2. Send `OPTIONS` request with `Origin: http://evil.com`
  3. Response contains `access-control-allow-origin: *`
- **Expected**: CORS should restrict allowed origins to the dashboard domain
- **Actual**: Any origin can make authenticated requests if the token is obtained
- **Evidence**: `access-control-allow-origin: *` in response headers

---

## BUG-5: Registration API Mismatch — Dashboard Doesn't Send Required `orgName`

- **Severity**: critical
- **Location**: `packages/dashboard/src/stores/authStore.ts` line 14, `packages/server/src/routes/auth.ts` line 12
- **Steps to reproduce**:
  1. Server register schema requires `orgName`, `name`, `email`, `password`
  2. Dashboard `register()` sends `{ email, password, name }` — no `orgName`
  3. Attempt to register via dashboard
- **Expected**: Registration should succeed
- **Actual**: Server returns 400 validation error: `orgName` is required. Registration is completely broken from the dashboard.
- **Evidence**: Server schema: `orgName: z.string().min(1)` / Dashboard call: `api.post('/auth/register', { email, password, name })`

---

## BUG-6: Password Minimum Length Too Weak (6 Characters)

- **Severity**: medium
- **Location**: `packages/server/src/routes/auth.ts` line 16
- **Steps to reproduce**:
  1. Register with password `123456` (6 chars)
  2. Registration succeeds
- **Expected**: Minimum 8 characters, with complexity requirements (uppercase, number, special char)
- **Actual**: Only 6 character minimum, no complexity requirements
- **Evidence**: `password: z.string().min(6)`

---

## BUG-7: No Role-Based Authorization — Any Authenticated User Has Full Access

- **Severity**: high
- **Location**: `packages/server/src/middleware/auth.ts`, all route files
- **Steps to reproduce**:
  1. JWT payload contains `role` field (e.g., `OWNER`)
  2. The `authenticate` middleware only verifies the token — never checks the role
  3. No route checks `req.user.role` before allowing destructive operations
  4. A user with any role can access all admin endpoints
- **Expected**: Role-based checks (e.g., only OWNER can delete, manage API keys, etc.)
- **Actual**: Role is stored in token but never enforced anywhere
- **Evidence**: `authenticate` middleware sets `req.user` but no middleware or route checks `req.user.role`

---

## BUG-8: JWT Expiration Too Long (7 Days) With No Refresh Token Flow

- **Severity**: medium
- **Location**: `packages/server/src/routes/auth.ts` line 24
- **Steps to reproduce**:
  1. Login and receive token with 7-day expiry
  2. Token is valid for 7 full days with no way to revoke (see BUG-3)
  3. No refresh token mechanism exists
- **Expected**: Short-lived access token (15-60 min) with refresh token rotation
- **Actual**: Single long-lived token, increasing window for stolen token abuse
- **Evidence**: `{ expiresIn: '7d' }` in `signToken()`

---

## BUG-9: Login Error Response Leaks Internal Error Messages

- **Severity**: medium
- **Location**: `packages/server/src/routes/auth.ts` lines 80, 58, 100
- **Steps to reproduce**:
  1. Trigger a server error during login (e.g., database down)
  2. Response includes `(err as Error).message` directly
- **Expected**: Generic error message; internal details logged server-side only
- **Actual**: Raw error message returned to client, potentially leaking database/system info
- **Evidence**: `res.status(500).json({ error: 'Login failed', message: (err as Error).message });`

---

## BUG-10: No Organization Slug Uniqueness Validation on Register

- **Severity**: medium
- **Location**: `packages/server/src/routes/auth.ts` lines 34-36
- **Steps to reproduce**:
  1. Register org with name "Acme Corp" → slug `acme-corp`
  2. Register another org with name "Acme Corp!" → slug also `acme-corp`
  3. Second registration will fail with uncaught Prisma unique constraint error
- **Expected**: Check slug uniqueness before insert, return friendly error
- **Actual**: Relies on database constraint, returns raw 500 error with Prisma internals
- **Evidence**: `const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');` — no uniqueness check

---

## BUG-11: Dashboard Login Error Reads Wrong Field From Response

- **Severity**: low
- **Location**: `packages/dashboard/src/pages/LoginPage.tsx` line 20
- **Steps to reproduce**:
  1. Attempt login with wrong credentials
  2. Server returns `{ error: 'Invalid credentials' }`
  3. Dashboard reads `err.response.data.message` which is `undefined`
  4. Falls back to generic "Login failed" instead of showing the actual error
- **Expected**: Show "Invalid credentials" from server
- **Actual**: Shows generic "Login failed" because it reads `.message` but server sends `.error`
- **Evidence**: Server: `{ error: 'Invalid credentials' }` / Dashboard: `err?.response?.data?.message || 'Login failed'`

---

## BUG-12: API Key Authentication Doesn't Scope to Specific Permissions

- **Severity**: medium
- **Location**: `packages/server/src/middleware/apiKey.ts`
- **Steps to reproduce**:
  1. API key auth sets `req.apiOrg = { orgId }` with no role or scope
  2. Any API key for an org has implicit full access to that org's data
- **Expected**: API keys should have scoped permissions (read-only, write, admin)
- **Actual**: No permission scoping on API keys
- **Evidence**: `req.apiOrg = { orgId: apiKey.orgId };` — no scope/permissions field

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 2     |
| High     | 3     |
| Medium   | 4     |
| Low      | 1     |
| **Total**| **12**|

### Critical Issues Requiring Immediate Fix:
1. **BUG-1**: Hardcoded JWT secret fallback — trivial token forgery
2. **BUG-5**: Registration completely broken from dashboard (missing `orgName`)
