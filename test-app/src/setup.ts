/**
 * Setup script: creates monitors, components, and component groups
 * in the status page service pointing to the test app.
 *
 * Usage: tsx src/setup.ts <statuspage-api-url> <jwt-token>
 * Example: tsx src/setup.ts http://localhost:3000 eyJhbG...
 */

const apiUrl = process.argv[2];
const token = process.argv[3];

if (!apiUrl || !token) {
  console.error('Usage: tsx src/setup.ts <statuspage-api-url> <jwt-token>');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
};

async function post(path: string, body: Record<string, unknown>) {
  const res = await fetch(`${apiUrl}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}

async function main() {
  console.log('Creating monitors...');

  const monitors = [
    { name: 'Health Check', type: 'HTTP', target: 'http://localhost:3040/health', interval: 60, expectedStatus: 200 },
    { name: 'Slow Endpoint', type: 'HTTP', target: 'http://localhost:3040/slow', interval: 120, expectedStatus: 200 },
    { name: 'Flaky Service', type: 'HTTP', target: 'http://localhost:3040/flaky', interval: 60, expectedStatus: 200 },
    { name: 'Always Failing', type: 'HTTP', target: 'http://localhost:3040/crash', interval: 300, expectedStatus: 200 },
    {
      name: 'Keyword Check', type: 'HTTP', target: 'http://localhost:3040/keyword',
      interval: 120, keyword: 'All Systems Operational', keywordType: 'CONTAINS',
    },
  ];

  const createdMonitors: Record<string, string> = {};

  for (const m of monitors) {
    try {
      const result = await post('/api/monitors', m);
      const id = (result as any).id ?? (result as any).monitor?.id;
      createdMonitors[m.name] = id;
      console.log(`  ✓ ${m.name} (id: ${id})`);
    } catch (e: any) {
      console.error(`  ✗ ${m.name}: ${e.message}`);
    }
  }

  console.log('\nCreating component group...');
  let groupId: string | undefined;
  try {
    const group = await post('/api/component-groups', { name: 'Test App Services' });
    groupId = (group as any).id ?? (group as any).group?.id;
    console.log(`  ✓ Test App Services (id: ${groupId})`);
  } catch (e: any) {
    console.error(`  ✗ Group: ${e.message}`);
  }

  console.log('\nCreating components...');
  const components = [
    { name: 'API Server', monitorName: 'Health Check' },
    { name: 'Background Worker', monitorName: 'Slow Endpoint' },
    { name: 'External Integration', monitorName: 'Flaky Service' },
  ];

  for (const c of components) {
    try {
      const body: Record<string, unknown> = {
        name: c.name,
        ...(groupId && { groupId }),
        ...(createdMonitors[c.monitorName] && { monitorId: createdMonitors[c.monitorName] }),
      };
      const result = await post('/api/components', body);
      const id = (result as any).id ?? (result as any).component?.id;
      console.log(`  ✓ ${c.name} (id: ${id})`);
    } catch (e: any) {
      console.error(`  ✗ ${c.name}: ${e.message}`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
