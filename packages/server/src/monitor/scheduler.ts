import { CheckResult, MonitorType } from './types';
import { httpCheck } from './checks/http';
import { tcpCheck } from './checks/tcp';
import { pingCheck } from './checks/ping';
import { sslCheck } from './checks/ssl';
import { heartbeatCheck } from './checks/heartbeat';
import { dnsCheck } from './checks/dns';
import { processCheckResult } from './processor';

const DEFAULT_REGION = 'us-east';

export class MonitorScheduler {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private prisma: any;
  private running = false;

  constructor(prisma: any) {
    this.prisma = prisma;
  }

  start(intervalMs: number = 10000): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), intervalMs);
    // Run immediately on start
    this.tick();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async tick(): Promise<void> {
    if (this.running) return; // prevent overlap
    this.running = true;

    try {
      const now = new Date();
      const monitors = await this.prisma.monitor.findMany({
        where: {
          enabled: true,
          OR: [
            { lastCheckedAt: null },
            {
              // Due: lastCheckedAt + interval < now
              // We compute this with raw filter
            },
          ],
        },
      });

      // Filter due monitors in JS (Prisma doesn't support computed date comparisons easily)
      const dueMonitors = monitors.filter((m: any) => {
        if (!m.lastCheckedAt) return true;
        const nextCheck = new Date(m.lastCheckedAt.getTime() + m.interval * 1000);
        return nextCheck <= now;
      });

      await Promise.allSettled(
        dueMonitors.map(async (monitor: any) => {
          try {
            const result = await this.runCheck(monitor);
            await processCheckResult(this.prisma, monitor.id, result);
          } catch (err) {
            console.error(`[Scheduler] Error checking monitor ${monitor.id}:`, err);
          }
        })
      );
    } catch (err) {
      console.error('[Scheduler] Tick error:', err);
    } finally {
      this.running = false;
    }
  }

  private async runCheck(monitor: any): Promise<CheckResult> {
    const type: MonitorType = monitor.type;
    const timeoutMs = monitor.timeout * 1000;
    const target = monitor.target || monitor.url || '';

    switch (type) {
      case 'HTTP': {
        const r = await httpCheck({
          target,
          method: monitor.method || 'GET',
          headers: monitor.headers ?? undefined,
          body: monitor.body ?? undefined,
          expectedStatus: monitor.expectedStatus ?? 200,
          keyword: monitor.keyword ?? undefined,
          keywordType: monitor.keywordType ?? undefined,
          timeout: timeoutMs,
        });
        return { status: r.status, responseTime: r.responseTime, statusCode: r.statusCode, error: r.error, region: DEFAULT_REGION };
      }

      case 'TCP': {
        const r = await tcpCheck({ target, timeout: timeoutMs });
        return { status: r.status, responseTime: r.responseTime, error: r.error, region: DEFAULT_REGION };
      }

      case 'PING': {
        const r = await pingCheck({ target, timeout: timeoutMs });
        return { status: r.status, responseTime: r.responseTime, error: r.error, region: DEFAULT_REGION, metadata: r.metadata };
      }

      case 'SSL': {
        const r = await sslCheck({
          target,
          timeout: timeoutMs,
          expiryThreshold: monitor.sslExpiryThreshold ?? 30,
        });
        return { status: r.status, responseTime: r.responseTime, error: r.error, region: DEFAULT_REGION, metadata: r.metadata };
      }

      case 'HEARTBEAT': {
        const r = heartbeatCheck({
          lastCheckedAt: monitor.lastCheckedAt,
          gracePeriod: monitor.heartbeatGrace ?? 300,
        });
        return { status: r.status, responseTime: r.responseTime, error: r.error, region: DEFAULT_REGION, metadata: r.metadata };
      }

      case 'DNS': {
        const r = await dnsCheck({ target, timeout: timeoutMs });
        return { status: r.status, responseTime: r.responseTime, error: r.error, region: DEFAULT_REGION, metadata: r.metadata };
      }

      default:
        return { status: 'DOWN', responseTime: 0, error: `Unknown monitor type: ${type}`, region: DEFAULT_REGION };
    }
  }
}
