# QA Report — Agent 3: UI/UX — Dashboard & Public Status Page

**Date**: 2026-02-15
**Scope**: `packages/dashboard/src/` and `packages/public-page/src/`
**Deploy URL**: https://sp-server-production-a53a.up.railway.app

---

## BUG-1: Learn page not routed — inaccessible in dashboard

- **Severity**: medium
- **Location**: `packages/dashboard/src/main.tsx` (routes) and `packages/dashboard/src/components/Layout.tsx` (nav)
- **Steps to reproduce**:
  1. Log in to dashboard
  2. Try to navigate to Learn page
- **Expected**: Learn page is accessible via navigation
- **Actual**: `Learn` component is exported as a named export `{ Learn }` and imported nowhere. No route exists for `/learn` in `main.tsx`, and no nav item in `Layout.tsx` links to it. The entire Learn page is dead code.
- **Evidence**:
  ```tsx
  // main.tsx — no Learn import or route
  // Layout.tsx navItems — no learn entry
  // Learn.tsx exports: export function Learn() { ... }
  ```

## BUG-2: Learn page hardcodes light theme — ignores dark mode

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/Learn.tsx`, lines throughout
- **Steps to reproduce**:
  1. If Learn page were routed, open it in dark mode
- **Expected**: Respects dark mode like all other dashboard pages
- **Actual**: Hardcoded light-only colors: `text-gray-900`, `bg-white`, `border-gray-200`, `bg-gray-50`, `text-gray-500`, etc. No `dark:` variants anywhere in the component.
- **Evidence**:
  ```tsx
  <h1 className="text-2xl font-bold text-gray-900">Learn</h1>
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm ...">
  <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
  ```

## BUG-3: console.error left in production code (public-page)

- **Severity**: low
- **Location**: `packages/public-page/src/hooks/useStatusPage.ts`, line ~68
- **Steps to reproduce**:
  1. Open public status page when API is unreachable
  2. Open browser console
- **Expected**: No console output in production
- **Actual**: `console.error(e)` logs error to console
- **Evidence**:
  ```tsx
  } catch (e) {
    setError('Failed to load status data');
    console.error(e);
  }
  ```

## BUG-4: Dashboard SettingsPage Toggle component has conflicting click handlers

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`, `Toggle` component (bottom of file)
- **Steps to reproduce**:
  1. Go to Settings page
  2. Click a toggle switch
- **Expected**: Toggle changes state once
- **Actual**: The `<input>` has `onChange` calling `onChange(e.target.checked)`, AND the parent `<div>` has `onClick` calling `onChange(!checked)`. Clicking the div triggers both handlers, potentially double-toggling. The `<label>` wrapping everything also propagates clicks to the checkbox.
- **Evidence**:
  ```tsx
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm">{label}</span>
    <div className="relative">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
      <div className={...} onClick={() => onChange(!checked)}>
        <div className={...} />
      </div>
    </div>
  </label>
  ```

## BUG-5: MonitorModal headers field — uncaught JSON.parse error crashes form

- **Severity**: high
- **Location**: `packages/dashboard/src/components/MonitorModal.tsx`, line ~85 in `handleSubmit`
- **Steps to reproduce**:
  1. Create new HTTP monitor
  2. Enter invalid JSON in Headers field (e.g., `{bad`)
  3. Click "Create Monitor"
- **Expected**: Validation error shown to user
- **Actual**: `JSON.parse(headers)` throws uncaught SyntaxError. While the outer try/catch may catch it, the error message will be generic "Save failed" instead of telling the user their JSON is invalid. Worse, the error object from JSON.parse has no `.response.data.message`, so users get unhelpful feedback.
- **Evidence**:
  ```tsx
  headers: headers ? JSON.parse(headers) : undefined
  // No validation before parsing
  ```

## BUG-6: ComponentsPage — no error handling on API calls

- **Severity**: high
- **Location**: `packages/dashboard/src/pages/ComponentsPage.tsx`, `handleSave`, `handleDelete`, `handleStatusChange`, `moveComponent`
- **Steps to reproduce**:
  1. Try to save a component when API returns 500
  2. Or delete a component that fails
- **Expected**: Error message shown to user
- **Actual**: `handleSave` has no catch block (only `finally`). `handleDelete`, `handleStatusChange`, and `moveComponent` have no error handling at all. A failed API call will result in an unhandled promise rejection and no user feedback.
- **Evidence**:
  ```tsx
  const handleSave = async () => {
    setSaving(true);
    try {
      // ... api calls
      setShowForm(null);
      await load();
    } finally {
      setSaving(false);  // no catch!
    }
  };
  
  const handleStatusChange = async (id: string, status: string) => {
    await api.patch(`/components/${id}`, { status });  // no try/catch
    // ...
  };
  ```

## BUG-7: IncidentsPage — handleCreate has no error handling

- **Severity**: high
- **Location**: `packages/dashboard/src/pages/IncidentsPage.tsx`, `handleCreate` function
- **Steps to reproduce**:
  1. Open "New Incident" modal
  2. Fill in details and submit
  3. API returns error (e.g., 500)
- **Expected**: Error message shown to user
- **Actual**: No catch block. Only `finally` sets `setSaving(false)`. Unhandled rejection, no feedback.
- **Evidence**:
  ```tsx
  const handleCreate = async () => {
    setSaving(true);
    try {
      const { data } = await api.post('/incidents', { ... });
      navigate(`/incidents/${incident.id}`);
    } finally {
      setSaving(false);  // no catch
    }
  };
  ```

## BUG-8: IncidentDetailPage — multiple actions lack error handling

- **Severity**: high
- **Location**: `packages/dashboard/src/pages/IncidentDetailPage.tsx`, `handleResolve`, `handleEditSave`, `handleAddUpdate`
- **Steps to reproduce**:
  1. Click "Resolve" on an incident when API fails
- **Expected**: Error feedback
- **Actual**: `handleResolve` and `handleEditSave` have zero error handling. `handleAddUpdate` has a finally but no catch. `handleDelete` also has no catch.
- **Evidence**:
  ```tsx
  const handleResolve = async () => {
    if (!id) return;
    await api.patch(`/incidents/${id}`, { status: 'resolved' });  // no try/catch
    await load();
  };
  ```

## BUG-9: MonitorDetailPage — delete/pause/resume lack error handling

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/MonitorDetailPage.tsx`, `handleDelete`, `handlePause`, `handleResume`
- **Steps to reproduce**:
  1. Click "Delete" on a monitor, API fails
- **Expected**: Error feedback
- **Actual**: No try/catch on any of these handlers. Unhandled promise rejection.
- **Evidence**:
  ```tsx
  const handleDelete = async () => {
    if (!id || !confirm('Delete this monitor?')) return;
    await deleteMonitor(id);  // no try/catch
    navigate('/monitors');
  };
  ```

## BUG-10: SubscribersPage — delete has no error handling

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/SubscribersPage.tsx`, `handleDelete`
- **Steps to reproduce**:
  1. Click delete on a subscriber, API fails
- **Expected**: Error shown
- **Actual**: Optimistically removes from local state, no catch block. If API fails, UI shows subscriber removed but it's not actually deleted.
- **Evidence**:
  ```tsx
  const handleDelete = async (id: string) => {
    if (!confirm('Remove this subscriber?')) return;
    await api.delete(`/subscribers/${id}`);  // no try/catch
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };
  ```

## BUG-11: NotificationsPage — create/delete/test lack proper error handling

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/NotificationsPage.tsx`
- **Steps to reproduce**:
  1. Create a notification channel when API fails
- **Expected**: Error message
- **Actual**: `handleCreate` has no catch. `handleDelete` has no catch. `handleTest` uses `alert()` for both success and failure which is poor UX.
- **Evidence**:
  ```tsx
  const handleTest = async (id: string) => {
    // ...
    alert('Test notification sent!');  // uses native alert()
    // ...
    alert('Test failed');  // uses native alert()
  };
  ```

## BUG-12: SettingsPage — handleCreateKey uses alert() for errors

- **Severity**: low
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`, `handleCreateKey`
- **Steps to reproduce**:
  1. Try to create an API key when API fails
- **Expected**: Inline error message
- **Actual**: `alert('Failed to create API key')` — native browser alert is poor UX
- **Evidence**:
  ```tsx
  } catch {
    alert('Failed to create API key');
  }
  ```

## BUG-13: OverviewPage — no error state when all API calls fail

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/OverviewPage.tsx`
- **Steps to reproduce**:
  1. Navigate to Overview when API is completely down
- **Expected**: Error message shown
- **Actual**: Uses `Promise.allSettled` which never throws, so loading finishes and page renders with empty data. No indication that data failed to load — appears as if there's genuinely no data.
- **Evidence**:
  ```tsx
  const [mRes, iRes, sRes] = await Promise.allSettled([...]);
  // Silently ignores all failures, shows empty state
  ```

## BUG-14: MonitorsPage table not responsive on small screens

- **Severity**: low
- **Location**: `packages/dashboard/src/pages/MonitorsPage.tsx`
- **Steps to reproduce**:
  1. View Monitors page on mobile
- **Expected**: Table is scrollable or adapts to small screen
- **Actual**: While some columns are hidden with `hidden md:table-cell`, the table itself has no `overflow-x-auto` wrapper. On very small screens, the remaining columns (Name, Type, Status) may still overflow.
- **Evidence**:
  ```tsx
  <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden">
    <table className="w-full text-sm">
    // No overflow-x-auto on wrapper
  ```

## BUG-15: Public page SSE connection opened before data fetch completes

- **Severity**: low
- **Location**: `packages/public-page/src/hooks/useStatusPage.ts`
- **Steps to reproduce**:
  1. Load public status page
- **Expected**: SSE events are applied after initial data is loaded
- **Actual**: The SSE `useEffect` and `fetchAll` `useEffect` both run on mount simultaneously. An SSE event arriving before `fetchAll` completes could update `components` state that's still empty, or be overwritten when `fetchAll` completes. Race condition.
- **Evidence**:
  ```tsx
  // Both run on mount:
  useEffect(() => { /* SSE setup */ }, [slug]);
  useEffect(() => { fetchAll(); }, [fetchAll]);
  ```

## BUG-16: Public page subscribe endpoint mismatch — `/api/subscribe` vs expected pattern

- **Severity**: medium
- **Location**: `packages/public-page/src/components/SubscribeForm.tsx`, line ~16
- **Steps to reproduce**:
  1. Enter email on public status page and click Subscribe
- **Expected**: Subscription succeeds
- **Actual**: Posts to `/api/subscribe` while all other public page endpoints use `/api/public/{slug}/...` pattern. If the server expects the slug-scoped pattern, this will 404.
- **Evidence**:
  ```tsx
  await axios.post('/api/subscribe', { email, slug });
  // vs other calls: axios.get(`/api/public/${slug}/status`)
  ```

## BUG-17: Dashboard uses `confirm()` for destructive actions — poor UX

- **Severity**: low
- **Location**: Multiple files — `MonitorDetailPage.tsx`, `ComponentsPage.tsx`, `IncidentDetailPage.tsx`, `SubscribersPage.tsx`, `NotificationsPage.tsx`, `SettingsPage.tsx`
- **Steps to reproduce**:
  1. Click any delete button
- **Expected**: Styled confirmation modal
- **Actual**: Native browser `confirm()` dialog which looks jarring and inconsistent with the dark theme UI
- **Evidence**:
  ```tsx
  if (!confirm('Delete this monitor?')) return;
  // Used across 6+ pages
  ```

## BUG-18: Register page — no password validation (length, complexity)

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/RegisterPage.tsx`
- **Steps to reproduce**:
  1. Go to /register
  2. Enter a single character password
  3. Submit
- **Expected**: Client-side validation for minimum password length
- **Actual**: No `minLength` attribute, no validation. Only `required` is set. Single-character passwords are accepted client-side.
- **Evidence**:
  ```tsx
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required  // no minLength or pattern
  ```

## BUG-19: SettingsPage — CNAME instruction uses placeholder hostname

- **Severity**: low
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`
- **Steps to reproduce**:
  1. Go to Settings > Custom Domain
- **Expected**: CNAME target points to actual deployment hostname
- **Actual**: Hardcoded `statuspage.yourhost.com` which is not a real address. Should use the actual deploy URL or be configurable.
- **Evidence**:
  ```tsx
  <code className="block mt-1 text-indigo-400">
    {config.customDomain || 'status.yourdomain.com'} CNAME statuspage.yourhost.com
  </code>
  ```

## BUG-20: Dashboard and Public Page both serve from root — routing conflict

- **Severity**: high
- **Location**: Server routing — dashboard serves at `/`, public page at `/status/`
- **Steps to reproduce**:
  1. Visit `https://sp-server-production-a53a.up.railway.app/` — shows dashboard login
  2. Visit `https://sp-server-production-a53a.up.railway.app/status` — redirects to `/status/` — shows public page
- **Expected**: Clear separation, or the public status page should be the default landing page for unauthenticated users
- **Actual**: Root `/` shows the dashboard login page to everyone including public visitors. A public user looking for service status would not know to go to `/status`. The public page slug-based routing (`useStatusPage` reads path as slug) will use `status` as the slug from `/status/` path.
- **Evidence**:
  ```
  curl / → dashboard HTML
  curl /status → redirect to /status/ → public page HTML
  ```

## BUG-21: Public page useStatusPage slug detection uses entire path as slug

- **Severity**: medium
- **Location**: `packages/public-page/src/hooks/useStatusPage.ts`, `getSlug()`
- **Steps to reproduce**:
  1. Visit `/status/` — slug becomes `status`
  2. API calls go to `/api/public/status/status` (potentially wrong)
- **Expected**: Slug correctly identifies the status page instance
- **Actual**: `getSlug()` strips slashes and uses entire remaining path. If served at `/status/`, the slug is `status`. Nested paths like `/status/page` would produce slug `status/page`. This may not match server expectations.
- **Evidence**:
  ```tsx
  function getSlug(): string {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    return path || 'default';
  }
  ```

## BUG-22: Dashboard MonitorModal — setInterval naming shadow

- **Severity**: low
- **Location**: `packages/dashboard/src/components/MonitorModal.tsx`
- **Steps to reproduce**: Code review only
- **Expected**: No variable name shadows global `setInterval`
- **Actual**: `const [interval, setInterval] = useState(...)` shadows the global `window.setInterval`. While it doesn't cause a bug since the component doesn't use timers, it's a code smell that could cause confusing issues during maintenance.
- **Evidence**:
  ```tsx
  const [interval, setInterval] = useState(monitor?.interval || 60);
  // shadows window.setInterval
  ```

## BUG-23: Public page — empty components array shows no empty state

- **Severity**: low
- **Location**: `packages/public-page/src/components/ComponentList.tsx`
- **Steps to reproduce**:
  1. Load public status page with no components configured
- **Expected**: Message like "No components configured" or similar
- **Actual**: `ComponentList` renders empty divs — no groups and no ungrouped items, resulting in a blank section with no context
- **Evidence**:
  ```tsx
  // No empty state check — just renders empty containers
  {ungrouped.length > 0 && ( ... )}
  // If both groups and ungrouped are empty, nothing renders
  ```

## BUG-24: Dashboard OverviewPage — uptime calculation excludes paused monitors incorrectly

- **Severity**: low
- **Location**: `packages/dashboard/src/pages/OverviewPage.tsx`
- **Steps to reproduce**:
  1. Have 3 monitors: 2 UP, 1 PAUSED
  2. View Overview page
- **Expected**: Uptime shows 100% (both active monitors are up)
- **Actual**: Calculates `Math.round((up / Math.max(monitors.length - paused, 1)) * 100)`. With 2 UP and 1 PAUSED: `2 / max(3-1, 1) * 100 = 100%`. This works, BUT if a monitor is DOWN and one is PAUSED: 1 UP / (3-1) = 50%, which is correct. However, if ALL monitors are paused, `monitors.length - paused = 0`, fallback to 1, showing `0/1 = 0%`. A message like "N/A" would be more appropriate when all monitors are paused.
- **Evidence**:
  ```tsx
  value={up > 0 ? `${Math.round((up / Math.max(monitors.length - paused, 1)) * 100)}%` : '—'}
  ```

## BUG-25: SettingsPage — handleSave called from two separate buttons

- **Severity**: low
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`
- **Steps to reproduce**:
  1. Go to Settings
  2. Notice "Save Settings" button in config section AND another "Save" button in Custom Domain section
- **Expected**: Each section saves independently
- **Actual**: Both buttons call the same `handleSave` which sends the entire `config` object to `PATCH /settings`. This works but is confusing — clicking "Save" in Custom Domain also saves all other settings silently. Not a bug per se, but misleading UX with two save buttons.
- **Evidence**:
  ```tsx
  // In Status Page Configuration section:
  <button onClick={handleSave} ...>Save Settings</button>
  // In Custom Domain section:
  <button onClick={handleSave} ...>Save</button>
  ```

## BUG-26: SettingsPage — handleRevokeKey has no error handling

- **Severity**: medium
- **Location**: `packages/dashboard/src/pages/SettingsPage.tsx`, `handleRevokeKey`
- **Steps to reproduce**:
  1. Click "Revoke" on an API key when API is down
- **Expected**: Error message
- **Actual**: No try/catch. Unhandled promise rejection. The optimistic state update happens after the await, so at least state isn't incorrectly updated, but user gets no feedback.
- **Evidence**:
  ```tsx
  const handleRevokeKey = async (id: string) => {
    if (!confirm('Revoke this API key?')) return;
    await api.delete(`/api-keys/${id}`);  // no try/catch
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };
  ```

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 4 |
| Medium | 8 |
| Low | 10 |
| **Total** | **26** |

### Key Themes:
1. **Missing error handling** is the biggest systemic issue — nearly every page has async operations with no catch blocks (BUG-6, 7, 8, 9, 10, 11, 26)
2. **No error states for failed API calls** — pages silently show empty data when APIs fail (BUG-13)
3. **Dead code** — Learn page exists but has no route (BUG-1)
4. **Routing concerns** — Dashboard at `/` vs public page at `/status/`, slug detection issues (BUG-20, 21)
5. **Native browser dialogs** used instead of styled UI components (BUG-17, 11, 12)
