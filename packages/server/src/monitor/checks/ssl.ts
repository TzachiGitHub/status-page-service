import * as tls from 'tls';
import { CheckStatus } from '../types';

export interface SslCheckConfig {
  target: string; // hostname
  port?: number;
  timeout: number;
  expiryThreshold?: number; // days
}

export interface SslCheckResult {
  status: CheckStatus;
  responseTime: number;
  error?: string;
  metadata?: {
    subject: string;
    issuer: string;
    validFrom: string;
    validTo: string;
    daysUntilExpiry: number;
  };
}

export function calculateDaysUntilExpiry(validTo: string | Date): number {
  const expiry = new Date(validTo).getTime();
  const now = Date.now();
  return Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
}

export async function sslCheck(config: SslCheckConfig): Promise<SslCheckResult> {
  const { target, port = 443, timeout, expiryThreshold = 30 } = config;

  return new Promise((resolve) => {
    const start = performance.now();

    const timer = setTimeout(() => {
      socket.destroy();
      resolve({
        status: 'DOWN',
        responseTime: Math.round(performance.now() - start),
        error: `Timeout after ${timeout}ms`,
      });
    }, timeout);

    const socket = tls.connect({ host: target, port, servername: target, rejectUnauthorized: false }, () => {
      clearTimeout(timer);
      const responseTime = Math.round(performance.now() - start);
      const cert = socket.getPeerCertificate();

      if (!cert || !cert.valid_to) {
        socket.destroy();
        return resolve({ status: 'DOWN', responseTime, error: 'No certificate found' });
      }

      const daysUntilExpiry = calculateDaysUntilExpiry(cert.valid_to);
      const metadata = {
        subject: cert.subject?.CN || '',
        issuer: cert.issuer?.CN || '',
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysUntilExpiry,
      };

      socket.destroy();

      if (daysUntilExpiry <= 0) {
        return resolve({ status: 'DOWN', responseTime, error: 'Certificate expired', metadata });
      }
      if (daysUntilExpiry < expiryThreshold) {
        return resolve({ status: 'DEGRADED', responseTime, metadata });
      }
      resolve({ status: 'UP', responseTime, metadata });
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      socket.destroy();
      resolve({
        status: 'DOWN',
        responseTime: Math.round(performance.now() - start),
        error: err.message,
      });
    });
  });
}
