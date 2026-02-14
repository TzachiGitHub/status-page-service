export interface TooltipEntry {
  term: string;
  definition: string;
}

export const tooltipDefinitions: Record<string, TooltipEntry> = {
  uptime: {
    term: 'Uptime',
    definition:
      'The percentage of time a service is operational and accessible. Calculated as (total time − downtime) / total time × 100.',
  },
  downtime: {
    term: 'Downtime',
    definition:
      'Any period during which a service is unavailable or not functioning correctly for end users.',
  },
  sla: {
    term: 'SLA (Service Level Agreement)',
    definition:
      'A formal commitment between a service provider and customer defining expected uptime, response times, and remedies for failures.',
  },
  'nine-nines': {
    term: 'Nine-Nines',
    definition:
      'A shorthand for availability levels: 99.9% (three nines) = 8.7h downtime/year, 99.99% (four nines) = 52min/year, 99.999% (five nines) = 5min/year.',
  },
  '99.9%': {
    term: '99.9% Availability (Three Nines)',
    definition:
      'Allows approximately 8 hours and 45 minutes of downtime per year, or about 43 minutes per month.',
  },
  '99.99%': {
    term: '99.99% Availability (Four Nines)',
    definition:
      'Allows approximately 52 minutes of downtime per year, or about 4.3 minutes per month.',
  },
  '99.999%': {
    term: '99.999% Availability (Five Nines)',
    definition:
      'Allows approximately 5 minutes and 15 seconds of downtime per year. Requires extensive redundancy and automation.',
  },
  mttr: {
    term: 'MTTR (Mean Time To Recovery)',
    definition:
      'The average time it takes to restore a service after a failure. Lower MTTR means faster recovery and less impact on users.',
  },
  mttd: {
    term: 'MTTD (Mean Time To Detect)',
    definition:
      'The average time between when a failure occurs and when it is detected. Automated monitoring reduces MTTD significantly.',
  },
  mtbf: {
    term: 'MTBF (Mean Time Between Failures)',
    definition:
      'The average time between one failure and the next. Higher MTBF indicates more reliable systems.',
  },
  '200': {
    term: 'HTTP 200 OK',
    definition:
      'The request succeeded. The server has returned the requested resource successfully.',
  },
  '301': {
    term: 'HTTP 301 Moved Permanently',
    definition:
      'The requested resource has been permanently moved to a new URL. Clients should update their bookmarks.',
  },
  '302': {
    term: 'HTTP 302 Found',
    definition:
      'The requested resource temporarily resides at a different URL. The client should continue to use the original URL for future requests.',
  },
  '400': {
    term: 'HTTP 400 Bad Request',
    definition:
      'The server cannot process the request due to a client error such as malformed syntax or invalid parameters.',
  },
  '401': {
    term: 'HTTP 401 Unauthorized',
    definition:
      'The request requires authentication. The client must provide valid credentials to access the resource.',
  },
  '403': {
    term: 'HTTP 403 Forbidden',
    definition:
      'The server understood the request but refuses to authorize it. Authentication will not help.',
  },
  '404': {
    term: 'HTTP 404 Not Found',
    definition:
      'The server cannot find the requested resource. The URL may be incorrect or the resource may have been removed.',
  },
  '500': {
    term: 'HTTP 500 Internal Server Error',
    definition:
      'A generic server-side error indicating the server encountered an unexpected condition that prevented it from fulfilling the request.',
  },
  '502': {
    term: 'HTTP 502 Bad Gateway',
    definition:
      'The server, acting as a gateway or proxy, received an invalid response from an upstream server.',
  },
  '503': {
    term: 'HTTP 503 Service Unavailable',
    definition:
      'The server is temporarily unable to handle the request, usually due to maintenance or overload.',
  },
  '504': {
    term: 'HTTP 504 Gateway Timeout',
    definition:
      'The server, acting as a gateway or proxy, did not receive a timely response from an upstream server.',
  },
  'ssl/tls': {
    term: 'SSL/TLS',
    definition:
      'Secure Sockets Layer / Transport Layer Security — cryptographic protocols that encrypt data in transit between a client and server, ensuring privacy and data integrity.',
  },
  ssl: {
    term: 'SSL (Secure Sockets Layer)',
    definition:
      'The predecessor to TLS. While technically deprecated, the term "SSL" is still widely used to refer to TLS certificates and encrypted connections.',
  },
  tls: {
    term: 'TLS (Transport Layer Security)',
    definition:
      'The modern cryptographic protocol that secures internet communications. TLS 1.2 and 1.3 are the current recommended versions.',
  },
  'certificate authority': {
    term: 'Certificate Authority (CA)',
    definition:
      'A trusted organization that issues digital certificates, verifying the identity of websites and enabling encrypted HTTPS connections.',
  },
  "let's encrypt": {
    term: "Let's Encrypt",
    definition:
      'A free, automated, and open Certificate Authority that provides SSL/TLS certificates. It has made HTTPS accessible to everyone.',
  },
  'certificate expiry': {
    term: 'Certificate Expiry',
    definition:
      'The date when an SSL/TLS certificate becomes invalid. Expired certificates cause browser warnings and can break user trust. Monitoring expiry dates is critical.',
  },
  dns: {
    term: 'DNS (Domain Name System)',
    definition:
      'The internet\'s phone book — translates human-readable domain names (e.g., example.com) into IP addresses that computers use to communicate.',
  },
  'a record': {
    term: 'A Record',
    definition:
      'A DNS record that maps a domain name to an IPv4 address. The most fundamental type of DNS record.',
  },
  cname: {
    term: 'CNAME (Canonical Name)',
    definition:
      'A DNS record that creates an alias from one domain name to another. Often used to point subdomains to a primary domain.',
  },
  'mx record': {
    term: 'MX Record',
    definition:
      'A DNS record that specifies the mail servers responsible for receiving email for a domain, along with priority values.',
  },
  ttl: {
    term: 'TTL (Time To Live)',
    definition:
      'The duration (in seconds) that a DNS record is cached by resolvers before they query the authoritative server again. Lower TTL means faster propagation of changes.',
  },
  'name server': {
    term: 'Name Server',
    definition:
      'A server that hosts DNS records for a domain and responds to DNS queries. Each domain typically has at least two name servers for redundancy.',
  },
  tcp: {
    term: 'TCP (Transmission Control Protocol)',
    definition:
      'A connection-oriented protocol that ensures reliable, ordered delivery of data between applications. Used by HTTP, HTTPS, SSH, and most internet services.',
  },
  udp: {
    term: 'UDP (User Datagram Protocol)',
    definition:
      'A connectionless protocol that sends data without guaranteed delivery or ordering. Used for DNS queries, video streaming, and real-time applications where speed matters more than reliability.',
  },
  icmp: {
    term: 'ICMP (Internet Control Message Protocol)',
    definition:
      'A network protocol used by tools like ping and traceroute to send error messages and diagnostic information between network devices.',
  },
  ping: {
    term: 'Ping',
    definition:
      'A network utility that sends ICMP echo requests to a host and measures the round-trip time. Used to check if a host is reachable and measure latency.',
  },
  traceroute: {
    term: 'Traceroute',
    definition:
      'A network diagnostic tool that maps the path packets take from source to destination, showing each hop and its latency.',
  },
  mtr: {
    term: 'MTR (My Traceroute)',
    definition:
      'A network diagnostic tool that combines the functionality of ping and traceroute, providing real-time statistics for each hop along the route.',
  },
  port: {
    term: 'Port',
    definition:
      'A numbered endpoint for network communication. Common ports: 80 (HTTP), 443 (HTTPS), 22 (SSH), 3306 (MySQL), 5432 (PostgreSQL).',
  },
  'heartbeat monitoring': {
    term: 'Heartbeat Monitoring',
    definition:
      'A monitoring method where a service periodically sends a "heartbeat" signal to indicate it is alive. If the signal stops, an alert is triggered.',
  },
  'cron job': {
    term: 'Cron Job',
    definition:
      'A time-based scheduler on Unix-like systems that runs commands or scripts at specified intervals. Monitoring cron jobs ensures scheduled tasks complete successfully.',
  },
  'grace period': {
    term: 'Grace Period',
    definition:
      'A configurable time window after an expected heartbeat is missed before an alert is triggered. Prevents false alarms from minor delays.',
  },
  incident: {
    term: 'Incident',
    definition:
      'An event that causes or could cause a disruption to service quality. Incidents are tracked from detection through resolution.',
  },
  postmortem: {
    term: 'Postmortem',
    definition:
      'A structured review conducted after an incident to document what happened, why it happened, and what steps will prevent recurrence.',
  },
  'root cause analysis': {
    term: 'Root Cause Analysis (RCA)',
    definition:
      'A systematic process for identifying the fundamental cause of an incident, going beyond symptoms to find the underlying issue.',
  },
  rca: {
    term: 'RCA (Root Cause Analysis)',
    definition:
      'A systematic process for identifying the fundamental cause of an incident, going beyond symptoms to find the underlying issue.',
  },
  'blameless postmortem': {
    term: 'Blameless Postmortem',
    definition:
      'A postmortem culture that focuses on improving systems and processes rather than assigning individual blame. Encourages honest reporting.',
  },
  operational: {
    term: 'Operational',
    definition:
      'All systems are functioning normally with no known issues affecting performance or availability.',
  },
  'degraded performance': {
    term: 'Degraded Performance',
    definition:
      'The service is operational but experiencing slower response times or reduced throughput compared to normal conditions.',
  },
  'partial outage': {
    term: 'Partial Outage',
    definition:
      'Some components or features of the service are unavailable while others continue to function normally.',
  },
  'major outage': {
    term: 'Major Outage',
    definition:
      'The service is completely unavailable or severely impaired, affecting all or most users.',
  },
  'under maintenance': {
    term: 'Under Maintenance',
    definition:
      'The service is intentionally taken offline for planned updates, upgrades, or repairs. Users are typically notified in advance.',
  },
  sre: {
    term: 'SRE (Site Reliability Engineering)',
    definition:
      'A discipline that applies software engineering practices to infrastructure and operations, focusing on reliability, scalability, and automation.',
  },
  devops: {
    term: 'DevOps',
    definition:
      'A set of practices that combines software development (Dev) and IT operations (Ops) to shorten the development lifecycle and deliver high-quality software continuously.',
  },
  'on-call': {
    term: 'On-Call',
    definition:
      'A rotation where team members are designated to respond to production incidents outside normal working hours, ensuring 24/7 coverage.',
  },
  'escalation policy': {
    term: 'Escalation Policy',
    definition:
      'A set of rules defining who gets notified and in what order when an incident is detected and not acknowledged within a specified time.',
  },
  runbook: {
    term: 'Runbook',
    definition:
      'A documented set of step-by-step procedures for handling specific operational tasks or incidents. Reduces response time and ensures consistency.',
  },
  webhook: {
    term: 'Webhook',
    definition:
      'An HTTP callback that sends real-time data to a specified URL when an event occurs. Used for instant notifications without polling.',
  },
  'sse': {
    term: 'SSE (Server-Sent Events)',
    definition:
      'A standard allowing servers to push real-time updates to clients over a single HTTP connection. Simpler than WebSockets for one-way data flow.',
  },
  'server-sent events': {
    term: 'Server-Sent Events (SSE)',
    definition:
      'A standard allowing servers to push real-time updates to clients over a single HTTP connection. Simpler than WebSockets for one-way data flow.',
  },
  polling: {
    term: 'Polling',
    definition:
      'A technique where the client repeatedly requests data from the server at regular intervals. Simple but less efficient than push-based approaches.',
  },
  websocket: {
    term: 'WebSocket',
    definition:
      'A communication protocol providing full-duplex (two-way) real-time communication between client and server over a single persistent connection.',
  },
  'long polling': {
    term: 'Long Polling',
    definition:
      'A variation of polling where the server holds the request open until new data is available, reducing unnecessary requests while maintaining near-real-time updates.',
  },
  component: {
    term: 'Component',
    definition:
      'A distinct part of your infrastructure displayed on a status page, such as API, Website, Database, or CDN. Each can have its own status.',
  },
  service: {
    term: 'Service',
    definition:
      'A discrete unit of functionality in your infrastructure that can be independently monitored, deployed, and scaled.',
  },
  dependency: {
    term: 'Dependency',
    definition:
      'An external service or resource that your system relies on to function. Dependency failures can cascade and affect your own service availability.',
  },
  'third-party component': {
    term: 'Third-Party Component',
    definition:
      'An external service your system depends on (e.g., Stripe for payments, AWS for hosting) that you monitor but do not directly control.',
  },
  subscriber: {
    term: 'Subscriber',
    definition:
      'A user who has opted in to receive notifications about status changes, incidents, and scheduled maintenance for your service.',
  },
  'notification channel': {
    term: 'Notification Channel',
    definition:
      'A delivery method for alerts and updates, such as email, SMS, Slack, Microsoft Teams, webhooks, or push notifications.',
  },
  'alert fatigue': {
    term: 'Alert Fatigue',
    definition:
      'A condition where responders become desensitized to alerts due to excessive or irrelevant notifications, leading to slower response times or missed critical alerts.',
  },
  'api key': {
    term: 'API Key',
    definition:
      'A unique identifier used to authenticate requests to an API. API keys should be kept secret and rotated regularly.',
  },
  jwt: {
    term: 'JWT (JSON Web Token)',
    definition:
      'A compact, URL-safe token format used for securely transmitting information between parties. Commonly used for authentication and authorization.',
  },
  'bearer token': {
    term: 'Bearer Token',
    definition:
      'An access token sent in the Authorization header of HTTP requests. Anyone who possesses ("bears") the token can use it to access protected resources.',
  },
  oauth: {
    term: 'OAuth',
    definition:
      'An open authorization framework that allows third-party applications to access user resources without exposing credentials. OAuth 2.0 is the current standard.',
  },
  'custom domain': {
    term: 'Custom Domain',
    definition:
      'Using your own domain name (e.g., status.yourcompany.com) instead of a provider subdomain for your status page.',
  },
  'cname record': {
    term: 'CNAME Record',
    definition:
      'A DNS record that creates an alias pointing one domain to another. Used to configure custom domains for hosted services.',
  },
  subdomain: {
    term: 'Subdomain',
    definition:
      'A prefix added to a domain name (e.g., status.example.com) that can point to a different server or service than the main domain.',
  },
  'dns propagation': {
    term: 'DNS Propagation',
    definition:
      'The time it takes for DNS changes to spread across all DNS servers worldwide. Can take from minutes to 48 hours depending on TTL values.',
  },
  'rate limiting': {
    term: 'Rate Limiting',
    definition:
      'Controlling the number of requests a client can make to an API within a given time window. Protects services from abuse and overload.',
  },
  throttling: {
    term: 'Throttling',
    definition:
      'Intentionally slowing down the processing rate of requests to prevent system overload. Similar to rate limiting but focuses on throughput.',
  },
  'circuit breaker': {
    term: 'Circuit Breaker',
    definition:
      'A design pattern that prevents cascading failures by temporarily stopping requests to a failing service, allowing it time to recover before retrying.',
  },
  backoff: {
    term: 'Backoff',
    definition:
      'A retry strategy where the delay between retries increases (often exponentially) to avoid overwhelming a recovering service.',
  },
  'response time': {
    term: 'Response Time',
    definition:
      'The total time from when a request is sent to when a complete response is received. Includes network latency, server processing, and data transfer.',
  },
  latency: {
    term: 'Latency',
    definition:
      'The time delay between sending a request and receiving the first byte of the response. Lower latency means a more responsive service.',
  },
  p50: {
    term: 'P50 (50th Percentile)',
    definition:
      'The median response time — 50% of requests are faster than this value. Represents the typical user experience.',
  },
  p95: {
    term: 'P95 (95th Percentile)',
    definition:
      'The response time below which 95% of requests fall. Captures the experience of most users, including slower requests.',
  },
  p99: {
    term: 'P99 (99th Percentile)',
    definition:
      'The response time below which 99% of requests fall. Represents worst-case scenarios excluding extreme outliers.',
  },
  throughput: {
    term: 'Throughput',
    definition:
      'The number of requests a system can process per unit of time. Measured in requests per second (RPS) or transactions per second (TPS).',
  },
  'health check': {
    term: 'Health Check',
    definition:
      'An endpoint or process that verifies a service is running correctly. Returns a status indicating whether the service is healthy.',
  },
  'liveness probe': {
    term: 'Liveness Probe',
    definition:
      'A check that determines if a process is running. If it fails, the container or process is restarted. Used in Kubernetes and similar platforms.',
  },
  'readiness probe': {
    term: 'Readiness Probe',
    definition:
      'A check that determines if a service is ready to accept traffic. Unlike liveness probes, failure removes the instance from the load balancer rather than restarting it.',
  },
  'monitoring region': {
    term: 'Monitoring Region',
    definition:
      'A geographic location from which monitoring checks are performed. Using multiple regions ensures you detect localized outages.',
  },
  'multi-region': {
    term: 'Multi-Region',
    definition:
      'Deploying services across multiple geographic regions for redundancy, lower latency, and compliance with data residency requirements.',
  },
  'geo-redundancy': {
    term: 'Geo-Redundancy',
    definition:
      'Maintaining service replicas in geographically separated locations so that a regional failure does not cause a complete outage.',
  },
};
