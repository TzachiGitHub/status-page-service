import { CheckStatus } from '../types';

export interface HeartbeatCheckConfig {
  lastCheckedAt: Date | null;
  gracePeriod: number; // seconds
}

export interface HeartbeatCheckResult {
  status: CheckStatus;
  responseTime: number;
  error?: string;
  metadata?: { lastBeat: string | null; gracePeriod: number };
}

export function heartbeatCheck(config: HeartbeatCheckConfig): HeartbeatCheckResult {
  const { lastCheckedAt, gracePeriod } = config;

  if (!lastCheckedAt) {
    return {
      status: 'DOWN',
      responseTime: 0,
      error: 'No heartbeat received yet',
      metadata: { lastBeat: null, gracePeriod },
    };
  }

  const elapsed = (Date.now() - lastCheckedAt.getTime()) / 1000;

  if (elapsed > gracePeriod) {
    return {
      status: 'DOWN',
      responseTime: Math.round(elapsed * 1000),
      error: `Last heartbeat ${Math.round(elapsed)}s ago, grace period ${gracePeriod}s`,
      metadata: { lastBeat: lastCheckedAt.toISOString(), gracePeriod },
    };
  }

  return {
    status: 'UP',
    responseTime: Math.round(elapsed * 1000),
    metadata: { lastBeat: lastCheckedAt.toISOString(), gracePeriod },
  };
}
