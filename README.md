# Status Page & Uptime Monitor

A full-stack, self-hosted status page and uptime monitoring service. Monitor your infrastructure, display real-time status to users, and get notified when things go wrong.

![Dashboard](docs/screenshots/dashboard.png)
![Public Status Page](docs/screenshots/public-page.png)

## Features

- **Multi-protocol monitoring** — HTTP, TCP, Ping, DNS, SSL certificate, and Heartbeat checks
- **Real-time updates** — Server-Sent Events push status changes to dashboards instantly
- **Admin dashboard** — Full-featured React dashboard to manage monitors, incidents, components, and subscribers
- **Public status page** — Beautiful, branded status page for your users
- **Incident management** — Create, update, and resolve incidents with timeline updates
- **Component groups** — Organize services into logical groups
- **Notifications** — Email, Slack, and webhook notification channels
- **Subscriber alerts** — Let users subscribe to status updates via email
- **API keys** — Programmatic access to all functionality
- **Multi-org support** — Isolated organizations with role-based access (Owner, Admin, Editor, Viewer)

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Dashboard:** React, TypeScript, Tailwind CSS, Recharts, Zustand, React Router
- **Public Page:** React, TypeScript, Tailwind CSS
- **Monitoring:** Custom scheduler with HTTP/TCP/Ping/DNS/SSL/Heartbeat checkers
- **Notifications:** Nodemailer (email), Slack webhooks, custom webhooks with HMAC signing
- **Real-time:** Server-Sent Events (SSE)

## Quick Start

### Docker Compose (recommended)

```bash
git clone <repo-url> && cd status-page-service
docker-compose up -d
```

The app will be available at:
- **Dashboard:** http://localhost:3030
- **Public status page:** http://localhost:3030/status
- **API:** http://localhost:3030/api

### Manual Setup

**Prerequisites:** Node.js 20+, PostgreSQL 15+

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Build shared package
cd packages/shared && npm run build && cd ../..

# Generate Prisma client and run migrations
cd packages/server
npx prisma generate
npx prisma migrate dev
cd ../..

# Build frontend apps
cd packages/dashboard && npm run build && cd ../..
cd packages/public-page && npm run build && cd ../..

# Start the server
cd packages/server && npm run dev
```

## Architecture

```
status-page-service/
├── packages/
│   ├── shared/          # Shared types, constants, utilities
│   ├── server/          # Express API server
│   │   ├── prisma/      # Database schema & migrations
│   │   ├── src/
│   │   │   ├── routes/          # API route handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── middleware/      # Auth, validation, error handling
│   │   │   ├── monitor/         # Monitoring engine (scheduler, checkers, alerter)
│   │   │   ├── notifications/   # Email, Slack, webhook dispatching
│   │   │   ├── sse/             # Server-Sent Events manager
│   │   │   └── validation/      # Zod request schemas
│   │   └── ...
│   ├── dashboard/       # React admin dashboard (Vite)
│   └── public-page/     # React public status page (Vite)
├── test-app/            # Demo Express app for testing monitors
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## API Overview

| Endpoint | Description |
|---|---|
| `POST /api/auth/register` | Register new organization |
| `POST /api/auth/login` | Login and receive JWT |
| `GET /api/monitors` | List monitors |
| `POST /api/monitors` | Create monitor |
| `GET /api/components` | List components |
| `GET /api/incidents` | List incidents |
| `POST /api/incidents` | Create incident |
| `GET /api/subscribers` | List subscribers |
| `GET /api/public/:slug/status` | Public status data |
| `GET /api/sse/dashboard` | Real-time dashboard events (SSE) |
| `GET /api/public/:slug/sse` | Real-time public events (SSE) |
| `POST /api/heartbeat/:token` | Heartbeat monitor endpoint |
| `GET /api/health` | Health check |

All authenticated endpoints require `Authorization: Bearer <token>` header.

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `JWT_SECRET` | Secret for JWT signing | required |
| `PORT` | Server port | `3030` |
| `SMTP_HOST` | SMTP server host | `localhost` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | — |
| `SMTP_PASS` | SMTP password | — |
| `SMTP_FROM` | Sender email address | `noreply@statuspage.local` |

## Development

```bash
# Run all services in development mode
npm run dev

# Run server tests
cd packages/server && npx vitest run

# Run test-app tests
cd test-app && npx vitest run

# Type check
cd packages/server && npx tsc --noEmit
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

MIT
