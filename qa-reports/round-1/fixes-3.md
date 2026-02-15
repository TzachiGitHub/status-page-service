# Fixes Report — Agent 3 (BUG-041 through BUG-057)

## BUG-041: Dashboard Login Error Reads Wrong Response Field
**File**: `packages/dashboard/src/pages/LoginPage.tsx`
**Fix**: Changed error extraction to check both `err.response.data.error` and `err.response.data.message`, since server returns `{ error: '...' }`.

## BUG-042: Duplicate Component Names Allowed Within Same Organization
**File**: `packages/server/src/services/componentService.ts`
**Fix**: Added application-level uniqueness check in `create()` — queries for existing component with same name+orgId before creating, throws 409 if duplicate found.

## BUG-043: Reorder Components With Non-Existent IDs Silently Succeeds
**File**: `packages/server/src/services/componentService.ts`
**Fix**: Added validation in `reorder()` that checks all provided IDs exist in the org before performing the transaction. Returns 400 with list of missing IDs.

## BUG-044: Component Update Uses Spread Pattern — Safe by Accident (Fragile)
**Status**: Acknowledged code smell. Zod's default strip mode currently protects against injection. No code change needed — the existing Zod validation schemas already strip unknown fields. This is safe as long as `.passthrough()` is never added.

## BUG-045: console.error Left in Production Code (Public Page)
**File**: `packages/public-page/src/hooks/useStatusPage.ts`
**Fix**: Removed `console.error(e)` from the catch block in `fetchAll()`.

## BUG-046: Dashboard Uses Native confirm()/alert() Dialogs
**Files**: New `packages/dashboard/src/components/ConfirmDialog.tsx`, new `packages/dashboard/src/hooks/useConfirm.ts`, plus updates to:
- `MonitorDetailPage.tsx` — delete monitor
- `ComponentsPage.tsx` — delete component/group
- `IncidentDetailPage.tsx` — delete incident
- `SubscribersPage.tsx` — remove subscriber
- `NotificationsPage.tsx` — delete channel, test notification feedback (replaced alert() with inline toast)
- `SettingsPage.tsx` — revoke API key, key creation error (replaced alert() with inline toast)

**Fix**: Created a reusable `ConfirmDialog` component and `useConfirm` hook. All `confirm()` calls replaced with styled modal dialogs. All `alert()` calls replaced with inline toast notifications.

## BUG-047: Public Page SSE Race Condition With Initial Data Fetch
**File**: `packages/public-page/src/hooks/useStatusPage.ts`
**Fix**: Restructured to fetch data first via `fetchAll()`, then connect SSE only after the initial fetch completes. Uses a single `useEffect` with cancellation flag.

## BUG-048: SettingsPage CNAME Instruction Uses Placeholder Hostname
**File**: `packages/dashboard/src/pages/SettingsPage.tsx`
**Fix**: Replaced hardcoded `statuspage.yourhost.com` with `window.location.hostname` to show the actual server hostname.

## BUG-049: MonitorModal setInterval Variable Shadows Global
**File**: `packages/dashboard/src/components/MonitorModal.tsx`
**Fix**: Renamed state variable from `[interval, setInterval]` to `[checkInterval, setCheckInterval]`. The API payload still sends `interval: checkInterval`.

## BUG-050: Public Page No Empty State for Components
**File**: `packages/public-page/src/components/ComponentList.tsx`
**Fix**: Added early return with "No components configured yet." message when components array is empty.

## BUG-051: OverviewPage Uptime Calc Edge Case — All Monitors Paused Shows 0%
**File**: `packages/dashboard/src/pages/OverviewPage.tsx`
**Fix**: Changed uptime card to show "N/A" with "All monitors paused" subtitle when `monitors.length - paused === 0`, instead of dividing by 1 and showing 0%.

## BUG-052: Monitors Table Not Responsive on Small Screens
**File**: `packages/dashboard/src/pages/MonitorsPage.tsx`
**Fix**: Changed table wrapper from `overflow-hidden` to `overflow-x-auto` to enable horizontal scrolling on small screens.

## BUG-053: Negative Order Value Accepted for Components
**File**: `packages/server/src/validation/components.ts`
**Fix**: Added `.min(0)` to order field in both `CreateComponentSchema` and `CreateComponentGroupSchema`.

## BUG-054: Alert Model incidentId Has No Foreign Key Constraint
**File**: `packages/server/prisma/schema.prisma`
**Fix**: Added `incident Incident? @relation(...)` with `onDelete: SetNull` to the Alert model, and added reverse `alerts Alert[]` relation to the Incident model. Added index on `incidentId`.

## BUG-055: Public Uptime Returns 100% for Unmonitored Components
**File**: `packages/server/src/services/statusPageService.ts`
**Fix**: Changed `getPublicUptime()` to return `uptime: null, noData: true` for components with no monitors, instead of misleading `uptime: 100`.

## BUG-056: Learn Page Is Dead Code — Not Routed, Hardcodes Light Theme
**Files**: `packages/dashboard/src/pages/Learn.tsx`, `packages/dashboard/src/main.tsx`, `packages/dashboard/src/components/Layout.tsx`
**Fix**: 
- Added `/learn` route in main.tsx
- Added "Learn" nav item with BookOpen icon in Layout.tsx
- Added `dark:` variants to all color classes in Learn.tsx (bg-white → dark:bg-slate-800, text-gray-900 → dark:text-white, etc.)

## BUG-057: SettingsPage Has Two Save Buttons That Save Everything
**File**: `packages/dashboard/src/pages/SettingsPage.tsx`
**Fix**: Changed `handleSave` to accept optional `fields` parameter. The "Save Settings" button saves the full config. The "Save Domain" button now only sends `{ customDomain }`.

## BUG-033: OverviewPage Shows Empty State When All API Calls Fail
**File**: `packages/dashboard/src/pages/OverviewPage.tsx`
**Fix**: Added error state detection — when all three `Promise.allSettled` requests are rejected, shows error message with retry button. (Note: partially overlapped with another agent's work)

## BUG-034: Settings Page Toggle Has Conflicting Click Handlers
**File**: `packages/dashboard/src/pages/SettingsPage.tsx`
**Fix**: Removed the `onClick` handler from the toggle's `<div>` element. The `<input>` checkbox `onChange` handler is sufficient since the `<label>` wrapper already handles click propagation.

---

**All 3 packages build successfully** (server, dashboard, public-page).
