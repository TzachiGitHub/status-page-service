export interface LearnTopic {
  id: string;
  title: string;
  icon: string;
  summary: string;
  sections: { heading: string; content: string }[];
  keyTakeaways: string[];
}

export const learnTopics: LearnTopic[] = [
  {
    id: 'status-page-intro',
    title: 'What is a Status Page & Why You Need One',
    icon: '📊',
    summary:
      'A status page is a public-facing dashboard that communicates the real-time health of your services. Transparency builds trust and reduces support tickets.',
    sections: [
      {
        heading: 'What Is a Status Page?',
        content:
          'A status page is a dedicated webpage that shows the current operational status of your services, components, and infrastructure. It serves as the single source of truth during incidents and planned maintenance. Companies like GitHub, Stripe, and Atlassian all maintain public status pages because they understand that transparency is a competitive advantage.',
      },
      {
        heading: 'Why Transparency Matters',
        content:
          'When users experience issues, their first instinct is to check if the problem is on their end or yours. Without a status page, they flood your support channels. A well-maintained status page reduces support ticket volume by 30-50% during incidents because users can self-serve answers. It also demonstrates professionalism and builds long-term trust with your customer base.',
      },
      {
        heading: 'Key Components of a Status Page',
        content:
          'An effective status page includes: (1) Component-level status indicators showing which parts of your service are affected, (2) An incident timeline with real-time updates as your team investigates and resolves issues, (3) Historical uptime data so users can evaluate your reliability track record, (4) Subscription options so users receive proactive notifications instead of having to check manually, and (5) Scheduled maintenance windows to set expectations about planned downtime.',
      },
      {
        heading: 'Internal vs. Public Status Pages',
        content:
          'Public status pages face your customers and focus on user-impacting services. Internal status pages are for your engineering and operations teams, often showing more granular infrastructure details. Many organizations maintain both — a simplified public view and a detailed internal dashboard with metrics, logs, and runbook links.',
      },
    ],
    keyTakeaways: [
      'A status page is the single source of truth for service health',
      'Transparency during incidents reduces support tickets by 30-50%',
      'Include component status, incident timeline, uptime history, and subscriptions',
      'Consider separate public and internal status pages for different audiences',
      'Proactive communication builds customer trust and loyalty',
    ],
  },
  {
    id: 'uptime-monitoring-101',
    title: 'Uptime Monitoring 101',
    icon: '🔍',
    summary:
      'Uptime monitoring continuously checks your services using HTTP, TCP, Ping, and SSL checks to detect outages before your users notice.',
    sections: [
      {
        heading: 'What Is Uptime Monitoring?',
        content:
          'Uptime monitoring is the practice of continuously checking whether your services are available and responding correctly. Monitoring systems send requests to your endpoints at regular intervals (typically every 30 seconds to 5 minutes) and verify the responses match expected criteria. When a check fails, alerts are triggered so your team can respond quickly.',
      },
      {
        heading: 'HTTP/HTTPS Monitoring',
        content:
          'The most common type of monitor sends HTTP or HTTPS requests to a URL and checks the response. You can verify: (1) The HTTP status code is 200 (or another expected code), (2) The response body contains or does not contain specific text, (3) Response headers match expected values, (4) The response time is within an acceptable threshold. HTTPS monitoring also validates that the SSL certificate is valid and not about to expire.',
      },
      {
        heading: 'TCP Monitoring',
        content:
          'TCP monitors check whether a specific port on a server is accepting connections. This is useful for monitoring databases (port 3306 for MySQL, 5432 for PostgreSQL), mail servers (port 25, 587), game servers, or any non-HTTP service. The monitor attempts to establish a TCP connection and considers the check successful if the connection is accepted within the timeout period.',
      },
      {
        heading: 'Ping (ICMP) Monitoring',
        content:
          'Ping monitoring sends ICMP echo requests to verify that a host is reachable at the network level. It measures round-trip time and packet loss. While ping confirms network connectivity, it cannot tell you if the application running on that host is functioning correctly — which is why it is usually combined with application-level checks.',
      },
      {
        heading: 'SSL Certificate Monitoring',
        content:
          'SSL monitors track the expiration date of your TLS certificates and alert you before they expire. An expired certificate causes browsers to display security warnings, breaking user trust instantly. Best practice is to set alerts at 30, 14, 7, 3, and 1 day before expiry. SSL monitoring also checks for certificate chain issues, weak protocols, and configuration problems.',
      },
    ],
    keyTakeaways: [
      'Use HTTP monitoring for web services — check status codes, body content, and response time',
      'TCP monitoring covers non-HTTP services like databases and mail servers',
      'Ping monitoring verifies network reachability but not application health',
      'SSL monitoring prevents certificate expiry surprises and trust breakdowns',
      'Monitor from multiple regions to detect localized outages',
    ],
  },
  {
    id: 'sla-and-nines',
    title: 'SLA & the Nines',
    icon: '📈',
    summary:
      'Understanding SLA targets and what "the nines" really mean: 99.9% allows 8.7 hours of downtime per year, 99.99% allows just 52 minutes.',
    sections: [
      {
        heading: 'What Is an SLA?',
        content:
          'A Service Level Agreement (SLA) is a formal contract between a service provider and its customers that defines the expected level of service. The most critical metric in an SLA is typically the uptime guarantee, expressed as a percentage. SLAs also define what happens when the provider fails to meet the target — usually in the form of service credits or refunds.',
      },
      {
        heading: 'Understanding the Nines',
        content:
          'The "nines" refer to the number of 9s in your uptime percentage. Each additional nine represents a 10x reduction in allowed downtime: 99% (two nines) = 3.65 days/year, 99.9% (three nines) = 8 hours 45 minutes/year, 99.99% (four nines) = 52 minutes 34 seconds/year, 99.999% (five nines) = 5 minutes 15 seconds/year. The jump from each level requires exponentially more investment in redundancy, automation, and operations.',
      },
      {
        heading: 'SLO vs SLA vs SLI',
        content:
          'These three terms are related but distinct. SLI (Service Level Indicator) is the actual measured metric, like request latency or error rate. SLO (Service Level Objective) is the internal target your team aims for, typically stricter than the SLA. SLA (Service Level Agreement) is the external commitment to customers with contractual consequences. For example: your SLI might show 99.97% uptime, your SLO target might be 99.95%, and your SLA guarantee to customers might be 99.9%.',
      },
      {
        heading: 'Error Budgets',
        content:
          'An error budget is the acceptable amount of unreliability derived from your SLO. If your SLO is 99.9%, your error budget is 0.1% — about 43 minutes per month. Teams use error budgets to balance reliability with feature velocity: when the budget is healthy, ship features faster; when it is nearly exhausted, focus on reliability improvements. This approach, popularized by Google SRE, turns reliability into a shared objective rather than an absolute mandate.',
      },
      {
        heading: 'Choosing the Right Target',
        content:
          'Not every service needs five nines. A developer blog at 99% uptime is perfectly acceptable, while a payment processing API might need 99.99%. Consider: (1) The business impact of downtime, (2) User expectations and tolerance, (3) The cost of achieving each level of reliability, (4) Dependencies — your service cannot be more reliable than its least reliable critical dependency.',
      },
    ],
    keyTakeaways: [
      '99.9% uptime allows 8h 45min downtime/year; 99.99% allows only 52 minutes',
      'SLI is the measurement, SLO is the target, SLA is the contract',
      'Error budgets balance reliability investment with feature development',
      'Each additional nine requires roughly 10x more engineering effort',
      'Choose SLA targets based on business impact, not aspirational goals',
    ],
  },
  {
    id: 'incident-management',
    title: 'Incident Management Best Practices',
    icon: '🚨',
    summary:
      'Effective incident management follows four phases: detect, communicate, resolve, and learn. Fast detection and clear communication minimize user impact.',
    sections: [
      {
        heading: 'The Four Phases',
        content:
          'Incident management follows a clear lifecycle: (1) Detect — automated monitoring catches the issue before users report it, (2) Communicate — update your status page and notify affected users immediately, (3) Resolve — the on-call team diagnoses and fixes the root cause, and (4) Learn — conduct a postmortem to prevent recurrence. The best teams excel at all four phases, not just resolution.',
      },
      {
        heading: 'Incident Severity Levels',
        content:
          'Define clear severity levels so responders know how urgently to act: SEV1 (Critical) — complete service outage affecting all users, requires immediate all-hands response. SEV2 (Major) — significant degradation affecting many users, primary on-call responds immediately. SEV3 (Minor) — partial impact on a subset of users, can be handled during business hours. SEV4 (Low) — cosmetic issues or minor bugs with minimal user impact, handled in normal workflow.',
      },
      {
        heading: 'Communication During Incidents',
        content:
          'Update your status page within 5 minutes of detecting an incident. Even if you do not know the root cause yet, acknowledge the issue: "We are investigating reports of increased error rates on our API." Follow up every 15-30 minutes with meaningful updates. Tell users what you know, what you are doing, and when to expect the next update. After resolution, post a summary and timeline. Users forgive downtime far more readily when they feel informed.',
      },
      {
        heading: 'Incident Commander Role',
        content:
          'For serious incidents, designate an Incident Commander (IC) who coordinates the response. The IC does not fix the problem — they ensure the right people are engaged, communication is flowing, and decisions are made. The IC manages the war room, delegates tasks, tracks progress, and ensures status page updates happen on schedule. This separation of coordination from execution prevents chaos.',
      },
      {
        heading: 'Blameless Postmortems',
        content:
          'After every significant incident, conduct a blameless postmortem within 48 hours. Document: the timeline of events, contributing factors, what went well, what could be improved, and concrete action items with owners and deadlines. The "blameless" aspect is crucial — focus on systemic improvements, not individual mistakes. People make better decisions when they know they will not be punished for honest reporting.',
      },
    ],
    keyTakeaways: [
      'Follow four phases: detect, communicate, resolve, learn',
      'Define clear severity levels (SEV1-SEV4) with corresponding response expectations',
      'Update your status page within 5 minutes; follow up every 15-30 minutes',
      'Designate an Incident Commander for SEV1/SEV2 incidents',
      'Conduct blameless postmortems within 48 hours with concrete action items',
    ],
  },
  {
    id: 'alerting-strategies',
    title: 'Alerting Strategies',
    icon: '🔔',
    summary:
      'Good alerting balances detection speed with noise reduction. Learn about alert fatigue, escalation policies, and on-call rotation best practices.',
    sections: [
      {
        heading: 'The Alert Fatigue Problem',
        content:
          'Alert fatigue occurs when responders receive too many alerts, causing them to become desensitized and potentially miss critical issues. Studies show that when more than 30% of alerts are non-actionable, response quality degrades significantly. The solution is not fewer monitors — it is smarter alerting with proper thresholds, deduplication, and severity classification.',
      },
      {
        heading: 'Threshold Strategies',
        content:
          'Avoid alerting on single failures. Use strategies like: (1) Consecutive failures — alert only after 2-3 consecutive check failures to filter transient issues, (2) Percentage thresholds — alert when error rate exceeds 5% over a 5-minute window rather than on individual errors, (3) Anomaly detection — use historical baselines to identify deviations rather than fixed thresholds, (4) Composite checks — combine multiple signals (error rate + latency + throughput) before triggering.',
      },
      {
        heading: 'Escalation Policies',
        content:
          'An escalation policy defines who gets notified and when. A typical policy: Step 1 (0 min) — SMS and push notification to primary on-call. Step 2 (10 min) — if unacknowledged, notify secondary on-call. Step 3 (20 min) — if still unacknowledged, call the engineering manager. Step 4 (30 min) — notify the VP of Engineering. Each step increases urgency and reach. Automatic escalation ensures no alert goes unhandled.',
      },
      {
        heading: 'On-Call Rotation',
        content:
          'A healthy on-call rotation distributes the burden fairly across the team. Best practices: (1) Rotate weekly, with handoffs during business hours, (2) Provide compensation — either additional pay, time off, or reduced sprint commitments, (3) Limit on-call to teams of 4+ to avoid burnout, (4) Track on-call load — number of pages, off-hours interruptions, and time to acknowledge, (5) Empower on-call engineers to make decisions and take action without waiting for approval.',
      },
      {
        heading: 'Notification Channels',
        content:
          'Match the notification channel to the severity. For critical alerts: phone calls and SMS that bypass do-not-disturb settings. For warnings: push notifications and Slack messages during business hours. For informational: email digests or dashboard updates. Never use email alone for critical alerts — it is too easy to miss. Most teams use a combination: PagerDuty or Opsgenie for critical routing, Slack for team awareness, and email for records.',
      },
    ],
    keyTakeaways: [
      'Alert fatigue degrades response quality — keep non-actionable alerts below 30%',
      'Use consecutive failures and percentage thresholds instead of single-failure alerts',
      'Implement multi-step escalation policies with automatic promotion',
      'Rotate on-call weekly among 4+ team members with fair compensation',
      'Match notification channels to severity: phone for critical, Slack for warnings',
    ],
  },
  {
    id: 'heartbeat-monitoring',
    title: 'Heartbeat Monitoring',
    icon: '💓',
    summary:
      'Heartbeat monitoring tracks cron jobs, background workers, and scheduled tasks by expecting periodic check-in signals from your systems.',
    sections: [
      {
        heading: 'How Heartbeat Monitoring Works',
        content:
          'Unlike traditional monitoring where an external system checks your service, heartbeat monitoring works in reverse: your service sends a periodic HTTP request (a "heartbeat" or "ping") to the monitoring system. If the heartbeat is not received within the expected interval plus a grace period, an alert is triggered. This is ideal for monitoring tasks that run on a schedule rather than continuously.',
      },
      {
        heading: 'Monitoring Cron Jobs',
        content:
          'Cron jobs are notoriously difficult to monitor because they run at specific times and then exit. A cron job that fails silently — due to a server issue, disk full, or code error — might not be noticed for days or weeks. By adding a simple heartbeat ping at the end of each cron job (e.g., curl https://monitor.example.com/heartbeat/my-job), you get immediate notification when a scheduled task fails to complete.',
      },
      {
        heading: 'Background Workers and Queues',
        content:
          'Background workers (like Sidekiq, Celery, or Bull) process jobs asynchronously. Heartbeat monitoring ensures these workers are alive and processing jobs. Set up a periodic task that runs every few minutes and sends a heartbeat. If the worker is stuck, crashed, or the queue is backed up, the missing heartbeat triggers an alert. You can also monitor queue depth and processing latency as additional signals.',
      },
      {
        heading: 'Grace Periods',
        content:
          'A grace period is the buffer time after an expected heartbeat before alerting. If your cron job runs every hour, you might set a 10-minute grace period. The job could complete anywhere within that hour, and minor delays will not trigger false alarms. Choose grace periods based on: (1) The typical variance in execution time, (2) The business impact of a missed run, (3) How quickly you need to know about failures.',
      },
      {
        heading: 'Implementation Patterns',
        content:
          'Common heartbeat patterns: (1) Simple ping — send a GET/POST request on completion, (2) Start/complete — send a "start" signal when the job begins and a "complete" signal when it finishes, enabling monitoring of job duration and detection of hung jobs, (3) Payload heartbeat — include data like records processed or errors encountered in the heartbeat body for richer monitoring, (4) Exit code — report the job exit code so failures are distinguishable from missed runs.',
      },
    ],
    keyTakeaways: [
      'Heartbeat monitoring is "push" based — your service pings the monitor, not the other way around',
      'Essential for cron jobs, background workers, and batch processes that run on schedules',
      'Grace periods prevent false alarms from minor timing variations',
      'Use start/complete patterns to detect hung jobs, not just failed ones',
      'Include meaningful data in heartbeat payloads for richer monitoring insights',
    ],
  },
  {
    id: 'ssl-certificates',
    title: 'SSL Certificates',
    icon: '🔒',
    summary:
      'SSL/TLS certificates encrypt traffic and verify identity. Learn how TLS works, certificate authorities, auto-renewal, and expiry monitoring.',
    sections: [
      {
        heading: 'How TLS Works',
        content:
          'When a browser connects to an HTTPS server, a TLS handshake occurs: (1) The client sends a "hello" with supported TLS versions and cipher suites, (2) The server responds with its certificate and chosen cipher suite, (3) The client verifies the certificate against trusted Certificate Authorities, (4) Both sides derive a shared session key using asymmetric cryptography, (5) All subsequent data is encrypted with the session key using symmetric encryption. This entire process takes milliseconds with TLS 1.3.',
      },
      {
        heading: 'Certificate Authorities',
        content:
          'A Certificate Authority (CA) is a trusted third party that issues digital certificates. The CA verifies that you control the domain before issuing a certificate. There are three validation levels: Domain Validation (DV) — proves domain control, issued in minutes. Organization Validation (OV) — verifies the organization identity. Extended Validation (EV) — thorough vetting of the organization, shows company name in some browsers. For most purposes, DV certificates from Let\'s Encrypt are sufficient and free.',
      },
      {
        heading: 'Auto-Renewal with Let\'s Encrypt',
        content:
          'Let\'s Encrypt issues free DV certificates valid for 90 days, encouraging frequent rotation. Auto-renewal tools like Certbot or cloud provider integrations (AWS Certificate Manager, Cloudflare) handle renewal automatically. The ACME protocol powers this: your server proves domain control via HTTP challenge or DNS challenge, and receives a fresh certificate. Always test renewal in staging before production to catch configuration issues.',
      },
      {
        heading: 'Common SSL Problems',
        content:
          'Frequent SSL issues include: (1) Expired certificates — the most common cause of SSL errors, preventable with monitoring, (2) Incomplete certificate chain — the server must send intermediate certificates along with its own, (3) Mismatched domain — the certificate Common Name or SAN does not match the requested domain, (4) Mixed content — HTTPS page loading HTTP resources triggers browser warnings, (5) Weak protocols — TLS 1.0 and 1.1 are deprecated; ensure TLS 1.2 or 1.3 is used.',
      },
      {
        heading: 'Monitoring Certificate Health',
        content:
          'Set up SSL monitoring to: (1) Track certificate expiry and alert at 30, 14, 7, 3, and 1 day before, (2) Verify the certificate chain is complete and valid, (3) Check for weak cipher suites and protocol versions, (4) Monitor Certificate Transparency logs for unauthorized certificates issued for your domains, (5) Test from multiple locations to catch CDN or load balancer misconfigurations where different edges serve different certificates.',
      },
    ],
    keyTakeaways: [
      'TLS 1.3 handshake encrypts connections in just one round-trip',
      'Let\'s Encrypt provides free certificates valid for 90 days with auto-renewal',
      'Monitor expiry at 30, 14, 7, 3, and 1 day thresholds',
      'Always serve the full certificate chain including intermediate certificates',
      'Check Certificate Transparency logs for unauthorized certificate issuance',
    ],
  },
  {
    id: 'dns-monitoring',
    title: 'DNS Monitoring',
    icon: '🌐',
    summary:
      'DNS is the foundation of every internet service. Monitoring DNS records, propagation, and resolution ensures users can always find your services.',
    sections: [
      {
        heading: 'Why DNS Monitoring Matters',
        content:
          'DNS is involved in every single request to your service. If DNS resolution fails, your service is effectively down even if your servers are running perfectly. DNS issues cause some of the most confusing outages because standard HTTP monitors may not catch them — they often use cached DNS results. Dedicated DNS monitoring queries authoritative name servers directly to detect problems early.',
      },
      {
        heading: 'Key DNS Record Types',
        content:
          'The records you should monitor: A records map your domain to an IPv4 address (the most fundamental record). AAAA records map to IPv6 addresses. CNAME records create aliases from one domain to another. MX records define mail servers. TXT records hold verification data (SPF, DKIM, DMARC for email, domain verification for services). NS records specify your authoritative name servers. Monitor all critical records for unexpected changes.',
      },
      {
        heading: 'DNS Propagation',
        content:
          'When you change a DNS record, the update does not take effect instantly worldwide. DNS resolvers cache records based on the TTL value. During propagation, some users may see the old record while others see the new one. To minimize propagation issues: (1) Lower the TTL to 300 seconds (5 minutes) before making changes, (2) Wait for the old TTL to expire before making the change, (3) After the change propagates, restore the TTL to a higher value for better performance.',
      },
      {
        heading: 'Common DNS Failure Modes',
        content:
          'DNS can fail in several ways: (1) SERVFAIL — the authoritative server cannot answer the query, often due to DNSSEC misconfiguration, (2) NXDOMAIN — the domain does not exist, possibly due to an expired domain registration, (3) Timeout — the name server is unreachable or overloaded, (4) Wrong answer — the record returns an incorrect IP address, possibly from DNS hijacking or a misconfigured update, (5) High latency — slow DNS resolution adds seconds to every connection.',
      },
      {
        heading: 'DNS Monitoring Best Practices',
        content:
          'Set up comprehensive DNS monitoring: (1) Query authoritative name servers directly, not recursive resolvers, (2) Verify that A, CNAME, and MX records return expected values, (3) Monitor from multiple geographic regions to detect split-horizon or routing issues, (4) Alert on NXDOMAIN for your critical domains, (5) Track resolution latency — it adds to every request your users make, (6) Monitor domain registration expiry to prevent accidental domain loss.',
      },
    ],
    keyTakeaways: [
      'DNS failures can make your service unreachable even if servers are healthy',
      'Lower TTL before making DNS changes, then restore it after propagation',
      'Query authoritative name servers directly for accurate monitoring',
      'Monitor domain registration expiry to prevent accidental domain loss',
      'Track DNS resolution latency — it is added to every user request',
    ],
  },
  {
    id: 'building-trust',
    title: 'Building Trust with Transparency',
    icon: '🤝',
    summary:
      'Public status pages, subscriber notifications, and honest postmortems transform incidents from trust-breaking events into trust-building opportunities.',
    sections: [
      {
        heading: 'Transparency as Competitive Advantage',
        content:
          'Companies with public status pages are not admitting weakness — they are demonstrating confidence and maturity. When AWS, Google Cloud, or Stripe post detailed incident reports, it reinforces their credibility rather than diminishing it. Users know that all services experience downtime; what differentiates great providers is how openly and effectively they communicate about it.',
      },
      {
        heading: 'Proactive Notifications',
        content:
          'Do not wait for users to discover problems. When an incident occurs, send notifications through multiple channels: email, SMS, Slack/Teams integrations, and RSS feeds. Let users choose their preferred channels and which components they care about. A user who receives a notification saying "We are aware and working on it" is far less frustrated than one who discovers the issue on their own and finds silence.',
      },
      {
        heading: 'The Art of Status Updates',
        content:
          'Good status updates follow a formula: (1) State the current impact clearly — "Users may experience slow page loads on the dashboard," (2) Explain what you know so far — "We have identified elevated error rates on our database cluster," (3) Describe what you are doing — "Our team is actively scaling the database and investigating the root cause," (4) Set expectations — "We will provide another update within 30 minutes." Avoid jargon and blame. Be honest about what you do not know yet.',
      },
      {
        heading: 'Public Postmortems',
        content:
          'Publishing postmortems after significant incidents is one of the most powerful trust-building practices. A good public postmortem includes: a clear timeline, the root cause explanation in accessible language, the impact summary, immediate fixes applied, and long-term preventive measures. Companies like Cloudflare, GitLab, and PagerDuty have built strong reputations partly through their detailed and honest public postmortems.',
      },
      {
        heading: 'Scheduled Maintenance Communication',
        content:
          'Planned maintenance is an opportunity to demonstrate operational maturity. Notify subscribers at least 48 hours in advance. Include: the maintenance window start and end times (in multiple time zones), which services will be affected, what users can expect (full downtime, degraded performance, or rolling updates), and actions users should take to prepare. Send a reminder 1 hour before the window, and confirm completion afterward.',
      },
    ],
    keyTakeaways: [
      'Public status pages demonstrate confidence, not weakness',
      'Proactive notifications are always better than user-discovered outages',
      'Follow a consistent formula for status updates: impact, cause, action, timeline',
      'Public postmortems build lasting trust when written honestly and accessibly',
      'Announce scheduled maintenance at least 48 hours in advance',
    ],
  },
  {
    id: 'real-time-communication',
    title: 'Real-Time Communication',
    icon: '⚡',
    summary:
      'Webhooks, Server-Sent Events, and WebSockets each solve different real-time communication needs. Learn when to use each approach.',
    sections: [
      {
        heading: 'The Real-Time Spectrum',
        content:
          'Real-time communication exists on a spectrum from simple to complex: Polling (client asks repeatedly) → Long Polling (client asks, server holds until data) → Server-Sent Events (server pushes one-way) → WebSockets (full two-way channel) → Webhooks (server-to-server push). Each approach has tradeoffs in complexity, scalability, latency, and reliability. Choosing the right one depends on your specific use case.',
      },
      {
        heading: 'Webhooks',
        content:
          'Webhooks are HTTP POST requests sent from one server to another when an event occurs. For a status page service, webhooks notify external systems instantly when an incident is created or updated. Advantages: simple to implement, works with any HTTP-capable system, no persistent connections needed. Challenges: the receiving server must be available (implement retry logic with exponential backoff), payloads should be signed (HMAC) for security, and order is not guaranteed.',
      },
      {
        heading: 'Server-Sent Events (SSE)',
        content:
          'SSE allows a server to push updates to a browser over a single HTTP connection. The browser uses the EventSource API to receive a stream of events. SSE is perfect for status page live updates: a user watching your status page gets instant updates when status changes, without refreshing. Advantages: built into browsers (no library needed), automatic reconnection, works through most proxies and firewalls. Limitation: one-way only (server to client), and limited to text data.',
      },
      {
        heading: 'WebSockets',
        content:
          'WebSockets provide full-duplex communication over a single TCP connection. Both client and server can send messages at any time. Use WebSockets when you need: two-way communication (chat, collaborative editing), very low latency (gaming, trading), or binary data transfer. For status pages, WebSockets are usually overkill — SSE handles the one-way "push updates to viewers" pattern more simply.',
      },
      {
        heading: 'Choosing the Right Approach',
        content:
          'Decision framework: (1) Server-to-server event notifications → Webhooks. Simple, reliable, widely supported. (2) Live dashboard updates for browsers → SSE. One-way push, auto-reconnect, no library needed. (3) Interactive features needing two-way communication → WebSockets. More complex but necessary for chat or real-time collaboration. (4) Simple integrations or no persistent connection support → Long Polling. Universal compatibility fallback. (5) Infrequent updates where latency is acceptable → Regular Polling. Simplest to implement but least efficient.',
      },
    ],
    keyTakeaways: [
      'Webhooks are best for server-to-server event notifications with retry logic',
      'SSE is ideal for live status page updates — simple, one-way, auto-reconnecting',
      'WebSockets are for two-way communication — overkill for most status page needs',
      'Always implement HMAC signing for webhook payloads to ensure security',
      'Start with the simplest approach that meets your needs, then upgrade if necessary',
    ],
  },
];
