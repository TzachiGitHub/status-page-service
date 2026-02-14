import { CheckResult, CheckStatus, ComponentStatus } from './types';
import { evaluateAlert, AlertResult } from './alerter';
import { calculateUptimeForPeriod, calculateAvgResponseTime } from './uptime';

const DAY_MS = 86400000;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;

// SSE callback hook — another agent will wire this up
export let onCheckComplete: ((monitorId: string, result: CheckResult) => void) | null = null;
export let onAlert: ((alert: AlertResult) => void) | null = null;

export function setOnCheckComplete(cb: typeof onCheckComplete) {
  onCheckComplete = cb;
}

export function setOnAlert(cb: typeof onAlert) {
  onAlert = cb;
}

function checkStatusToComponentStatus(status: CheckStatus): ComponentStatus {
  switch (status) {
    case 'UP': return 'OPERATIONAL';
    case 'DEGRADED': return 'DEGRADED_PERFORMANCE';
    case 'DOWN': return 'MAJOR_OUTAGE';
  }
}

/**
 * Process a check result: store in DB, update monitor, evaluate alerts, update uptime cache.
 * Requires a prisma client instance to be passed in.
 */
export async function processCheckResult(
  prisma: any,
  monitorId: string,
  result: CheckResult
): Promise<AlertResult | null> {
  // 1. Record the check
  await prisma.monitorCheck.create({
    data: {
      monitorId,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode ?? null,
      region: result.region,
      error: result.error ?? null,
    },
  });

  // 2. Get the monitor
  const monitor = await prisma.monitor.findUnique({ where: { id: monitorId } });
  if (!monitor) return null;

  // 3. Update monitor status and lastCheckedAt
  await prisma.monitor.update({
    where: { id: monitorId },
    data: {
      currentStatus: result.status,
      lastCheckedAt: new Date(),
    },
  });

  // 4. Evaluate alerts
  const recentChecks = await prisma.monitorCheck.findMany({
    where: { monitorId },
    orderBy: { checkedAt: 'desc' },
    take: Math.max(monitor.alertAfter, monitor.recoveryAfter),
    select: { status: true },
  });

  const alertResult = evaluateAlert({
    monitorId,
    monitorName: monitor.name,
    currentStatus: monitor.currentStatus,
    alertAfter: monitor.alertAfter,
    recoveryAfter: monitor.recoveryAfter,
    recentChecks,
  });

  if (alertResult) {
    await prisma.monitorAlert.create({
      data: {
        monitorId,
        type: alertResult.type,
        message: alertResult.message,
      },
    });
    onAlert?.(alertResult);
  }

  // 5. Update uptime cache
  const allChecks = await prisma.monitorCheck.findMany({
    where: { monitorId, checkedAt: { gte: new Date(Date.now() - MONTH_MS) } },
    select: { status: true, responseTime: true, checkedAt: true },
  });

  await prisma.monitor.update({
    where: { id: monitorId },
    data: {
      uptimeDay: calculateUptimeForPeriod(allChecks, DAY_MS),
      uptimeWeek: calculateUptimeForPeriod(allChecks, WEEK_MS),
      uptimeMonth: calculateUptimeForPeriod(allChecks, MONTH_MS),
      avgResponseTime: calculateAvgResponseTime(allChecks),
    },
  });

  // 6. Update linked component status
  if (monitor.componentId) {
    await prisma.component.update({
      where: { id: monitor.componentId },
      data: { status: checkStatusToComponentStatus(result.status) },
    });
  }

  // 7. Emit SSE event
  onCheckComplete?.(monitorId, result);

  return alertResult;
}
