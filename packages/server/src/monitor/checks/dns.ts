import * as dns from 'dns/promises';
import { CheckStatus } from '../types';

export interface DnsCheckConfig {
  target: string; // hostname
  expectedIp?: string;
  expectedCname?: string;
  timeout: number;
}

export interface DnsCheckResult {
  status: CheckStatus;
  responseTime: number;
  error?: string;
  metadata?: { addresses?: string[]; cname?: string };
}

export async function dnsCheck(config: DnsCheckConfig): Promise<DnsCheckResult> {
  const { target, expectedIp, expectedCname, timeout } = config;
  const start = performance.now();

  try {
    const result = await Promise.race([
      (async () => {
        const addresses = await dns.resolve4(target);
        let cname: string | undefined;
        try {
          const cnames = await dns.resolveCname(target);
          cname = cnames[0];
        } catch {
          // no CNAME is fine
        }
        return { addresses, cname };
      })(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeout}ms`)), timeout)
      ),
    ]);

    const responseTime = Math.round(performance.now() - start);

    if (expectedIp && !result.addresses.includes(expectedIp)) {
      return {
        status: 'DOWN',
        responseTime,
        error: `Expected IP ${expectedIp} not found. Got: ${result.addresses.join(', ')}`,
        metadata: { addresses: result.addresses, cname: result.cname },
      };
    }

    if (expectedCname && result.cname !== expectedCname) {
      return {
        status: 'DOWN',
        responseTime,
        error: `Expected CNAME ${expectedCname}, got ${result.cname || 'none'}`,
        metadata: { addresses: result.addresses, cname: result.cname },
      };
    }

    return {
      status: 'UP',
      responseTime,
      metadata: { addresses: result.addresses, cname: result.cname },
    };
  } catch (err: any) {
    return {
      status: 'DOWN',
      responseTime: Math.round(performance.now() - start),
      error: err.message,
    };
  }
}
