import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
const uuid = () => crypto.randomUUID();

const prisma = new PrismaClient();

async function main() {
  // Clean up
  await prisma.$executeRawUnsafe('TRUNCATE TABLE organizations CASCADE');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      members: {
        create: {
          email: 'admin@example.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'OWNER',
        },
      },
    },
    include: { members: true },
  });

  console.log('Created org:', org.name);

  // Component groups
  const coreGroup = await prisma.componentGroup.create({
    data: { name: 'Core Services', order: 0, orgId: org.id },
  });
  const extGroup = await prisma.componentGroup.create({
    data: { name: 'External Services', order: 1, orgId: org.id },
  });

  // Components
  const [api, webapp, database, cdn, email] = await Promise.all([
    prisma.component.create({ data: { name: 'API', order: 0, orgId: org.id, groupId: coreGroup.id } }),
    prisma.component.create({ data: { name: 'Web App', order: 1, orgId: org.id, groupId: coreGroup.id } }),
    prisma.component.create({ data: { name: 'Database', order: 2, orgId: org.id, groupId: coreGroup.id } }),
    prisma.component.create({ data: { name: 'CDN', order: 0, orgId: org.id, groupId: extGroup.id } }),
    prisma.component.create({ data: { name: 'Email', order: 1, orgId: org.id, groupId: extGroup.id } }),
  ]);

  console.log('Created 5 components in 2 groups');

  // Monitors
  await Promise.all([
    prisma.monitor.create({
      data: { name: 'HTTP Check', type: 'HTTP', url: 'https://httpbin.org/status/200', interval: 60, orgId: org.id, componentId: api.id, expectedStatus: 200 },
    }),
    prisma.monitor.create({
      data: { name: 'Slow Endpoint', type: 'HTTP', url: 'https://httpbin.org/delay/2', interval: 120, timeout: 10, orgId: org.id, componentId: webapp.id },
    }),
    prisma.monitor.create({
      data: { name: 'SSL Check', type: 'SSL', url: 'https://httpbin.org', interval: 3600, orgId: org.id },
    }),
    prisma.monitor.create({
      data: { name: 'Heartbeat', type: 'HEARTBEAT', interval: 300, orgId: org.id },
    }),
  ]);

  console.log('Created 4 monitors');

  // Incidents
  const resolvedIncident = await prisma.incident.create({
    data: {
      title: 'Database connectivity issues',
      status: 'RESOLVED',
      severity: 'MAJOR',
      orgId: org.id,
      resolvedAt: new Date(),
      updates: {
        create: [
          { status: 'INVESTIGATING', message: 'We are investigating database connectivity issues.', createdAt: new Date(Date.now() - 3600000) },
          { status: 'IDENTIFIED', message: 'Root cause identified: connection pool exhaustion.', createdAt: new Date(Date.now() - 1800000) },
          { status: 'RESOLVED', message: 'Connection pool settings adjusted. All systems operational.', createdAt: new Date() },
        ],
      },
      components: {
        create: [{ componentId: database.id, status: 'MAJOR_OUTAGE' }],
      },
    },
  });

  const activeIncident = await prisma.incident.create({
    data: {
      title: 'Elevated API response times',
      status: 'MONITORING',
      severity: 'MINOR',
      orgId: org.id,
      updates: {
        create: [
          { status: 'INVESTIGATING', message: 'We are seeing elevated response times on the API.', createdAt: new Date(Date.now() - 600000) },
          { status: 'MONITORING', message: 'A fix has been deployed. Monitoring the situation.', createdAt: new Date() },
        ],
      },
      components: {
        create: [{ componentId: api.id, status: 'DEGRADED_PERFORMANCE' }],
      },
    },
  });

  console.log('Created 2 incidents');

  // Status page config
  await prisma.statusPageConfig.create({
    data: {
      orgId: org.id,
      title: 'Acme Corp Status',
      description: 'Real-time status and uptime for Acme Corp services.',
    },
  });

  // API key
  await prisma.apiKey.create({
    data: {
      name: 'Default API Key',
      key: `sp_${uuid().replace(/-/g, '')}`,
      orgId: org.id,
    },
  });

  console.log('Seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
