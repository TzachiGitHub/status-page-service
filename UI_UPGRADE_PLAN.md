# UI Upgrade Plan — Status Page & Uptime Monitor

> **Goal:** Transform the current functional-but-basic dashboard and public status page into a production-grade, BetterStack-quality product.
>
> **Date:** 2026-02-15

---

## 🚨 DEPLOYMENT BLOCKER

The Railway deployment is **crash-looping** due to a Prisma + Alpine OpenSSL incompatibility:

```
Error: Could not parse schema engine response
prisma:warn Prisma failed to detect the libssl/openssl version to use
```

**Fix:** Change `Dockerfile` base images from `node:20-alpine` to `node:20-slim` (Debian-based, includes OpenSSL), OR add `RUN apk add --no-cache openssl` to both stages. This must be fixed before any UI work matters.

---

## UI Research Summary

### BetterStack (Target Quality)
- **Dashboard:** Clean white/dark sidebar, green accent for "up", red for "down", minimal chrome
- **Layout:** Left sidebar nav with icons + labels, top bar with search + user avatar
- **Monitors:** Card-based list with sparkline charts inline, status dots, response time badges
- **Charts:** Interactive line charts with gradient fills, 30s/1m/5m/30m/1h/24h period selectors
- **Incidents:** Timeline-based, Slack integration, smart merging, AI SRE suggestions
- **Status Page:** Branded subdomain, uptime bars (90 days), subscribe via email, dark mode toggle, response time charts embedded
- **Colors:** Emerald green (#10b981), Amber (#f59e0b), Red (#ef4444), neutral grays, indigo accents
- **Typography:** Inter/system font, clear hierarchy, generous whitespace

### Statuspage.io (Atlassian)
- **Dashboard:** Enterprise-focused, component-centric view, subscriber management prominent
- **Status Page:** Iconic "All Systems Operational" green banner, component list with colored dots, incident timeline chronological
- **Features:** 150+ third-party component integrations, SMS/email/webhook notifications, Uptime Showcase for marketing

### Instatus
- **Dashboard:** Modern SaaS feel, quick setup wizard, Slack-first incident management
- **Status Page:** CDN-static (fast), 19 languages, brandable colors, operational color customization
- **Features:** On-call scheduling, monitoring built-in, more affordable positioning

---

## Agent Assignments

### 🔵 AGENT 1: Design System & Layout Foundation (TODOs 1-50)

#### 1.1 Design Tokens & Theme System
1. Create `packages/dashboard/src/theme/tokens.ts` with color palette (emerald/amber/red/slate/indigo)
2. Create `packages/dashboard/src/theme/shadows.ts` with elevation levels (sm, md, lg, xl)
3. Create `packages/dashboard/src/theme/spacing.ts` with consistent spacing scale (4px base)
4. Create `packages/dashboard/src/theme/typography.ts` with font sizes, weights, line heights
5. Create `packages/dashboard/src/theme/borders.ts` with radius tokens (sm: 6px, md: 8px, lg: 12px, xl: 16px)
6. Create `packages/dashboard/src/theme/animations.ts` with transition durations and easing curves
7. Create `packages/dashboard/src/theme/breakpoints.ts` for responsive design (sm/md/lg/xl/2xl)
8. Create `packages/dashboard/src/theme/index.ts` barrel export
9. Add CSS custom properties in `index.css` mirroring all tokens for Tailwind integration
10. Create dark/light theme variant maps using CSS custom properties

#### 1.2 Base UI Components Library
11. Create `components/ui/Button.tsx` — primary, secondary, ghost, danger, success variants with sizes (xs/sm/md/lg)
12. Create `components/ui/Badge.tsx` — status badges with dot indicator, color variants, sizes
13. Create `components/ui/Card.tsx` — elevated card with header/body/footer slots, hover states
14. Create `components/ui/Input.tsx` — text input with label, helper text, error state, prefix/suffix icons
15. Create `components/ui/Select.tsx` — styled select with custom dropdown, search, multi-select
16. Create `components/ui/Textarea.tsx` — auto-growing textarea with character count
17. Create `components/ui/Toggle.tsx` — animated toggle switch with label (replace current inline implementation)
18. Create `components/ui/Modal.tsx` — accessible modal with backdrop blur, sizes, close on escape
19. Create `components/ui/Dropdown.tsx` — context menu / dropdown with keyboard navigation
20. Create `components/ui/Tabs.tsx` — animated tab bar with underline indicator and pill variants
21. Create `components/ui/Table.tsx` — sortable table with sticky header, row hover, empty state
22. Create `components/ui/Avatar.tsx` — user avatar with initials fallback, status indicator
23. Create `components/ui/Tooltip.tsx` — replace current tooltip with proper portal-based tooltip using Radix/Floating UI
24. Create `components/ui/Toast.tsx` — toast notification system (success/error/warning/info) with auto-dismiss
25. Create `components/ui/Skeleton.tsx` — skeleton loading placeholders for every content type
26. Create `components/ui/EmptyState.tsx` — illustrated empty states with action button
27. Create `components/ui/ProgressBar.tsx` — horizontal progress bar with percentage label
28. Create `components/ui/Breadcrumb.tsx` — breadcrumb navigation for detail pages
29. Create `components/ui/IconButton.tsx` — round icon button with tooltip on hover
30. Create `components/ui/Divider.tsx` — horizontal/vertical divider with optional label

#### 1.3 Layout Overhaul
31. Redesign `Layout.tsx` sidebar — add logo slot, user avatar at bottom, collapsible mode
32. Add sidebar collapse/expand animation (icon-only mode for more content space)
33. Add sidebar section groupings with labels ("Monitoring", "Communication", "Settings")
34. Add active nav item indicator bar (left border accent, not full bg highlight)
35. Add sidebar footer with app version, "What's New" link, and user menu
36. Redesign top header — add global search bar (Cmd+K), notification bell, user dropdown
37. Add breadcrumb bar below header on detail pages
38. Add page transition animations (fade/slide) between routes
39. Create responsive breakpoint: sidebar becomes bottom tab bar on mobile
40. Add "View Status Page" button in sidebar linking to public page
41. Add environment indicator badge (dev/staging/production) in header
42. Create `PageHeader.tsx` component — title, description, action buttons (standardize all pages)
43. Create `PageContainer.tsx` — max-width container with consistent padding
44. Add keyboard shortcut system (Cmd+K search, G+M for monitors, G+I for incidents, etc.)
45. Add command palette (Cmd+K) with search across monitors, incidents, components
46. Implement proper dark mode with smooth transition (no flash on load)
47. Add sidebar notification badges (count of active incidents, down monitors)
48. Add responsive sidebar overlay with swipe-to-close on mobile
49. Add "Collapse sidebar" button with smooth width animation
50. Create `ScrollArea.tsx` — custom scrollbar styling for sidebar and main content

---

### 🟢 AGENT 2: Dashboard & Monitor Pages (TODOs 51-110)

#### 2.1 Overview Page Redesign
51. Redesign summary cards — larger numbers, trend arrows (↑↓), sparkline mini-charts inside cards
52. Add "Overall Health" hero section — large circular gauge or status banner at top
53. Add animated count-up numbers on summary cards on page load
54. Add "Last 24h" summary strip — number of checks, incidents, avg response time
55. Redesign monitor status section — use card grid instead of list, each card shows sparkline + status dot
56. Add "Uptime Overview" 90-day bar chart (BetterStack-style) showing all monitors combined
57. Add "Response Time Overview" area chart showing P50/P95/P99 across all monitors
58. Add "Recent Activity" feed — real-time stream of checks, status changes, incidents (like GitHub activity)
59. Add quick-action buttons: "Create Monitor", "Report Incident", "View Status Page"
60. Add "Currently Down" alert banner at top of overview when any monitor is down
61. Add time range selector for overview stats (1h, 6h, 24h, 7d, 30d)
62. Add "Certificate Expirations" widget showing upcoming SSL cert expirations
63. Add "Scheduled Maintenance" widget showing upcoming maintenance windows
64. Make overview cards clickable — navigate to relevant detail page
65. Add subtle gradient backgrounds to status cards based on health

#### 2.2 Monitors List Page
66. Redesign monitors table as card list view (BetterStack-style) — status dot, name, URL, uptime %, sparkline, last check
67. Add grid/list view toggle
68. Add bulk actions — pause/resume/delete multiple monitors
69. Add monitor grouping by tags/labels
70. Add "Quick Monitor" button — one-click HTTP monitor creation with just a URL
71. Add real-time status dot pulse animation for UP monitors
72. Add monitor type icons (globe for HTTP, lock for SSL, server for TCP, etc.)
73. Add inline 90-day uptime bar for each monitor in list view
74. Add average response time badge with color coding (green <200ms, yellow <500ms, red >500ms)
75. Add "Last incident" column showing time since last downtime
76. Add sort options: name, status, uptime%, response time, last checked
77. Add pagination with page size selector (10/25/50/100)
78. Add "Import monitors" button (CSV/JSON import)
79. Add "Export monitors" button (CSV/JSON export)
80. Add hover card preview on monitor name showing quick stats
81. Replace status text with animated status indicators (pulsing dot + tooltip)

#### 2.3 Monitor Detail Page
82. Redesign header — large status badge, monitor name, URL as clickable link, uptime % prominent
83. Add "Current Status" hero — large colored banner (green/red/yellow) with status text and duration
84. Add period selector tabs (1h, 6h, 24h, 7d, 30d, 90d) for all charts
85. Redesign response time chart — gradient fill area chart, P50/P95/P99 lines, hover tooltips with exact values
86. Add response time distribution histogram (bar chart showing ms buckets)
87. Redesign 90-day uptime bar — interactive, click on day to see details, tooltip with exact % and check counts
88. Add uptime percentage display for selected period with decimal precision
89. Add "Availability" section — monthly breakdown table (like BetterStack)
90. Add "Regions" section showing response times per monitoring region on a mini world map
91. Redesign check log table — better formatting, status icons, expandable rows for error details
92. Add check log filtering by status (success/fail) and date range
93. Add "Alerts" tab showing all alerts triggered for this monitor
94. Add "Configuration" tab showing monitor settings in read-only view
95. Add "Pause/Resume" confirmation dialog with reason field
96. Add response time trend indicator (↑↓ vs previous period)
97. Add "Copy monitor" action to duplicate a monitor configuration
98. Add SSL certificate details panel (expiry date, issuer, chain) for SSL monitors
99. Add DNS resolution details panel for DNS monitors
100. Add "Test Now" button to trigger an immediate check
101. Add error screenshot/response body viewer for failed checks
102. Add annotations on charts for incidents/maintenance windows

#### 2.4 Monitor Modal (Create/Edit)
103. Redesign MonitorModal — multi-step wizard flow (Type → Config → Alert Rules → Review)
104. Add URL validation with live preview/test before saving
105. Add "Test Connection" button that runs a real check before saving
106. Add suggested monitor name auto-fill from URL hostname
107. Add visual region selector with world map
108. Add advanced settings collapsible section (headers, body, authentication)
109. Add request body editor with syntax highlighting for POST monitors
110. Add "Clone from existing" option in create flow

---

### 🟡 AGENT 3: Incident & Component Pages (TODOs 111-160)

#### 3.1 Incidents Page
111. Redesign incident list — card-based with impact severity color strip on left edge
112. Add incident count badges on tabs (Active: 2, Resolved: 15, Scheduled: 1)
113. Add timeline view option (vertical timeline with dots and connecting lines)
114. Add "Affected Components" chips with color-coded status
115. Add duration column showing how long the incident lasted
116. Add filter by impact level (critical/major/minor/none)
117. Add filter by date range
118. Add filter by affected component
119. Add search within incidents (title, update messages)
120. Add "Templates" button — pre-written incident templates for common scenarios
121. Add bulk resolve action for multiple incidents
122. Add incident severity indicator icons (flame for critical, warning for major, info for minor)
123. Add "Export" button to download incidents as CSV/JSON for postmortem analysis

#### 3.2 Incident Detail Page
124. Redesign header — large impact severity banner with gradient, affected components listed
125. Add "Impact Duration" timer showing total time from creation to resolution
126. Redesign timeline — left-side colored dots with connecting line, timestamps, status transitions
127. Add timeline entry icons for each status (magnifying glass for investigating, target for identified, eye for monitoring, check for resolved)
128. Add rich text editor (Markdown) for incident update messages
129. Add "Notify Subscribers" checkbox on update form (opt-in/opt-out per update)
130. Add "Affected Components" management — add/remove components from incident
131. Add automatic component status change when incident is created/resolved
132. Add "Postmortem" tab — rich text editor for writing postmortem
133. Add "Postmortem" template generator with sections (Summary, Timeline, Root Cause, Action Items)
134. Add "Share" button generating a public link to the incident
135. Add "Linked Monitors" section showing which monitors triggered this incident
136. Add update editing — ability to edit/delete individual timeline entries
137. Add timestamps in relative format with absolute on hover ("2 hours ago" → "Feb 15, 2026 01:25 AM")
138. Add auto-save draft for update messages
139. Add keyboard shortcuts: Cmd+Enter to post update, Cmd+R to resolve

#### 3.3 Components Page
140. Redesign with drag-and-drop reordering (react-beautiful-dnd or dnd-kit)
141. Add visual status indicator bar for each component (colored left border)
142. Add inline status change — click status dot to cycle through statuses
143. Add component dependency mapping (visual graph showing component relationships)
144. Add "Status History" expandable section showing last 30 days of status changes
145. Add component metrics — link response time data to components
146. Add bulk status update — change multiple component statuses at once
147. Add component import/export
148. Redesign group UI — collapsible sections with group-level status summary
149. Add group drag-and-drop reordering
150. Add "Component Health" summary at top — pie chart showing status distribution
151. Add component description with Markdown support
152. Add component URL field (link to the actual service)
153. Add "Uptime" badge showing 30-day uptime percentage per component
154. Add color-coded status tags (green pill for operational, red for major outage, etc.)
155. Add "Automation" section — rules for auto-updating component status based on monitor state
156. Add component type icons (API, website, database, CDN, etc.)
157. Add "Display on Status Page" toggle per component
158. Add component ordering within groups via drag handles
159. Add empty group placeholder with "Add Component" button
160. Add group color/icon customization

---

### 🔴 AGENT 4: Settings, Notifications & Subscribers (TODOs 161-200)

#### 4.1 Settings Page
161. Redesign settings into tabbed sections (General, Appearance, Domain, API Keys, Team)
162. Add "Branding" section — logo upload, favicon upload, primary color picker, accent color picker
163. Add live preview of public status page while editing settings
164. Add "Custom CSS" editor with syntax highlighting (CodeMirror/Monaco)
165. Add "Custom HTML" injection for header/footer of public page
166. Add team management — invite members, role-based access (admin/editor/viewer)
167. Add team member list with avatar, role badge, last active date
168. Add API key scoping — read-only vs read-write permissions
169. Add API key usage stats (requests per day/month)
170. Add webhook secret management with regenerate functionality
171. Add "Danger Zone" section — delete account, export all data
172. Add backup/restore functionality for all settings
173. Add "Audit Log" page showing all admin actions
174. Add timezone selector for time display preferences
175. Add notification preferences per team member
176. Add two-factor authentication setup
177. Add SSO/SAML configuration section
178. Add custom domain SSL certificate status indicator

#### 4.2 Notifications Page
179. Redesign notification channel cards — larger, more visual, with status indicator (connected/disconnected)
180. Add notification channel type icons (email envelope, Slack logo, webhook globe, etc.)
181. Add "Notification Rules" — configure which events trigger which channels
182. Add notification event types: monitor down, monitor up, incident created, incident resolved, certificate expiring
183. Add notification throttling/rate limiting configuration
184. Add notification history log showing all sent notifications with delivery status
185. Add "Escalation Policies" — if no acknowledgment in X minutes, escalate to next channel
186. Add PagerDuty integration option
187. Add Microsoft Teams integration option
188. Add Discord integration option
189. Add Telegram integration option
190. Add SMS notification support (Twilio integration)
191. Add notification preview — show exactly what the message will look like
192. Add test notification with actual payload preview

#### 4.3 Subscribers Page
193. Redesign subscriber table — add search/filter, pagination
194. Add subscriber import from CSV
195. Add subscriber export to CSV
196. Add "Send Announcement" button — compose custom message to all subscribers
197. Add subscriber analytics — growth chart, confirmation rate, unsubscribe rate
198. Add subscriber segmentation by component subscriptions
199. Add email template customization for notification emails
200. Add "Resend Confirmation" action for pending subscribers

---

### 🟣 AGENT 5: Public Status Page Redesign (TODOs 201-250+)

#### 5.1 Layout & Branding
201. Add proper `<head>` meta tags — Open Graph, Twitter Card, favicon, theme-color
202. Add smooth page load animation (fade in sections sequentially)
203. Redesign Header — centered logo + page name, theme toggle as icon button, navigation links
204. Add "Subscribe" button in header (not just form at bottom)
205. Add custom Google Fonts support based on settings
206. Add branded color scheme applied from dashboard settings (primary, accent, operational colors)
207. Add custom favicon support
208. Add mobile-optimized responsive layout with better touch targets

#### 5.2 Status Banner
209. Redesign status banner — full-width with gradient, animated icon, larger text
210. Add subtle animation on status change (pulse/glow effect)
211. Add "Last updated X minutes ago" with auto-refresh indicator
212. Add operational uptime percentage in banner ("99.98% uptime in the last 90 days")

#### 5.3 Component List
213. Redesign component rows — more padding, clearer status indicators, hover effects
214. Add expandable component details — description, linked monitors info
215. Add component group summary status (worst status of children)
216. Improve 90-day uptime bar — smoother rendering, better colors, responsive sizing
217. Add "View Details" link per component showing response time chart
218. Add component status tooltip with exact uptime percentage

#### 5.4 Charts & Metrics
219. Redesign response time charts — gradient fill area charts matching BetterStack style
220. Add interactive zoom on charts (click and drag to zoom)
221. Add chart period selector (24h, 7d, 30d)
222. Add P50/P95/P99 latency lines on response time charts
223. Add custom metrics support — embed any Grafana/custom chart
224. Add combined overview chart showing all component response times

#### 5.5 Incidents Section
225. Redesign active incidents section — more prominent alert card with pulsing indicator
226. Add real-time incident updates via SSE (already implemented, improve UI)
227. Add "Subscribe to this incident" button per incident
228. Redesign incident history — calendar heatmap view option
229. Add incident filtering by component
230. Add incident RSS feed link
231. Improve timeline styling — bigger dots, clearer connector lines, status colors

#### 5.6 Scheduled Maintenance
232. Add countdown timer for upcoming maintenance windows
233. Add calendar view for scheduled maintenance
234. Add "Add to Calendar" (iCal) link for each maintenance window
235. Improve maintenance card design — blue accent, clear start/end times with timezone

#### 5.7 Subscribe Section
236. Redesign subscribe form — more prominent, card-based with icon
237. Add component-level subscription — choose which components to watch
238. Add SMS subscription option (if configured)
239. Add Slack subscription option (join a channel)
240. Add webhook subscription for developers
241. Add RSS/Atom feed link
242. Add subscription confirmation email template customization

#### 5.8 Footer & Polish
243. Redesign footer — centered, minimal, "Powered by StatusPage" with link
244. Add "System Metrics" section showing aggregate stats
245. Add keyboard shortcut: 'T' to toggle theme
246. Add print-friendly CSS for status page
247. Add JSON API link (/api/v1/status.json) for programmatic access
248. Add embeddable status badge (SVG) generator
249. Add "Status Page Embed" widget (iframe snippet for embedding in other sites)
250. Add multi-language support (i18n) with language selector

#### 5.9 Performance & SEO
251. Add static HTML generation / SSR for better SEO and initial load
252. Add Service Worker for offline status page caching
253. Add Web Vitals optimization (LCP < 1.5s, CLS < 0.1)
254. Add preload/prefetch for critical resources
255. Add `sitemap.xml` and `robots.txt` generation
256. Add structured data (JSON-LD) for search engines (WebSite, Organization schemas)

---

## Priority Order

1. **Fix deployment** (Dockerfile OpenSSL issue) — BLOCKER
2. **Agent 1** (Design System) — foundation everything else builds on
3. **Agent 2** (Dashboard & Monitors) — core user experience
4. **Agent 5** (Public Status Page) — customer-facing, high impact
5. **Agent 3** (Incidents & Components) — critical workflows
6. **Agent 4** (Settings & Notifications) — configuration layer

## Tech Stack Additions Needed
- **UI Library:** Radix UI primitives (for accessible modals, dropdowns, tooltips)
- **Drag & Drop:** @dnd-kit/core + @dnd-kit/sortable
- **Code Editor:** @uiw/react-codemirror (for Custom CSS/JSON editing)
- **Rich Text:** @tiptap/react (for incident updates / postmortems)
- **Charts:** Keep recharts, add visx for custom visualizations
- **Animations:** framer-motion for page transitions, layout animations
- **Command Palette:** cmdk (⌘K command menu)
- **Toast:** sonner (lightweight toast library)
- **Date handling:** date-fns (already may be present)
