import * as net from 'net';
import { CheckStatus } from '../types';

export interface PingCheckConfig {
  target: string; // host or host:port
  timeout: number;
  attempts?: number;
}

export interface PingCheckResult {
  status: CheckStatus;
  responseTime: number; // average ms
  error?: string;
  metadata?: { times: number[] };
}

function singlePing(host: string, port: number, timeout: number): Promise<number | null> {
  return new Promise((resolve) => {
    const start = performance.now();
    const socket = new net.Socket();

    const timer = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, timeout);

    socket.connect(port, host, () => {
      clearTimeout(timer);
      const elapsed = performance.now() - start;
      socket.destroy();
      resolve(Math.round(elapsed));
    });

    socket.on('error', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(null);
    });
  });
}

export async function pingCheck(config: PingCheckConfig): Promise<PingCheckResult> {
  const { target, timeout, attempts = 3 } = config;
  const parts = target.split(':');
  const host = parts[0];
  const port = parseInt(parts[1], 10) || 80;

  const times: number[] = [];
  for (let i = 0; i < attempts; i++) {
    const t = await singlePing(host, port, timeout);
    if (t !== null) times.push(t);
  }

  if (times.length === 0) {
    return { status: 'DOWN', responseTime: 0, error: `All ${attempts} attempts failed` };
  }

  const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  return {
    status: 'UP',
    responseTime: avg,
    metadata: { times },
  };
}
