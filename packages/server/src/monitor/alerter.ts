import { CheckResult, CheckStatus, AlertType } from './types';

export interface AlertResult {
  type: AlertType;
  message: string;
  monitorId: string;
}

export interface AlertEvalContext {
  monitorId: string;
  monitorName: string;
  currentStatus: string;
  alertAfter: number;
  recoveryAfter: number;
  recentChecks: { status: CheckStatus }[];
}

/**
 * Evaluate whether an alert should be triggered based on consecutive check results.
 * Returns an AlertResult if state change detected, null otherwise.
 */
export function evaluateAlert(ctx: AlertEvalContext): AlertResult | null {
  const { monitorId, monitorName, currentStatus, alertAfter, recoveryAfter, recentChecks } = ctx;

  if (recentChecks.length === 0) return null;

  // Check for DOWN: last N checks all DOWN
  if (recentChecks.length >= alertAfter) {
    const lastN = recentChecks.slice(0, alertAfter);
    const allDown = lastN.every((c) => c.status === 'DOWN');
    if (allDown && currentStatus !== 'DOWN') {
      return {
        type: 'DOWN',
        message: `${monitorName} is DOWN after ${alertAfter} consecutive failure(s)`,
        monitorId,
      };
    }
  }

  // Check for DEGRADED
  if (recentChecks.length >= alertAfter) {
    const lastN = recentChecks.slice(0, alertAfter);
    const allDegraded = lastN.every((c) => c.status === 'DEGRADED');
    if (allDegraded && currentStatus !== 'DEGRADED') {
      return {
        type: 'DEGRADED',
        message: `${monitorName} is DEGRADED after ${alertAfter} consecutive degraded check(s)`,
        monitorId,
      };
    }
  }

  // Check for RECOVERY: last N checks all UP and monitor was DOWN/DEGRADED
  if (recentChecks.length >= recoveryAfter && (currentStatus === 'DOWN' || currentStatus === 'DEGRADED')) {
    const lastN = recentChecks.slice(0, recoveryAfter);
    const allUp = lastN.every((c) => c.status === 'UP');
    if (allUp) {
      return {
        type: 'RECOVERY',
        message: `${monitorName} has recovered after ${recoveryAfter} consecutive success(es)`,
        monitorId,
      };
    }
  }

  return null;
}
