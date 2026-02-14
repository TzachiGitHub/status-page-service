import * as net from 'net';
import { CheckStatus } from '../types';

export interface TcpCheckConfig {
  target: string; // host:port
  timeout: number;
}

export interface TcpCheckResult {
  status: CheckStatus;
  responseTime: number;
  error?: string;
}

export async function tcpCheck(config: TcpCheckConfig): Promise<TcpCheckResult> {
  const { target, timeout } = config;
  const [host, portStr] = target.split(':');
  const port = parseInt(portStr, 10) || 80;

  return new Promise((resolve) => {
    const start = performance.now();
    const socket = new net.Socket();

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({
        status: 'DOWN',
        responseTime: Math.round(performance.now() - start),
        error: `Timeout after ${timeout}ms`,
      });
    }, timeout);

    socket.connect(port, host, () => {
      clearTimeout(timer);
      const responseTime = Math.round(performance.now() - start);
      socket.destroy();
      resolve({ status: 'UP', responseTime });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      const responseTime = Math.round(performance.now() - start);
      socket.destroy();
      resolve({ status: 'DOWN', responseTime, error: err.message });
    });
  });
}
