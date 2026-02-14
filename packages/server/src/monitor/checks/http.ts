import { CheckStatus, KeywordType } from '../types';

export interface HttpCheckConfig {
  target: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  expectedStatus?: number;
  keyword?: string;
  keywordType?: KeywordType;
  timeout: number;
}

export interface HttpCheckResult {
  status: CheckStatus;
  responseTime: number;
  statusCode: number;
  error?: string;
}

export async function httpCheck(config: HttpCheckConfig): Promise<HttpCheckResult> {
  const {
    target,
    method,
    headers,
    body,
    expectedStatus = 200,
    keyword,
    keywordType,
    timeout,
  } = config;

  const start = performance.now();

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(target, {
      method,
      headers: headers ?? undefined,
      body: body ?? undefined,
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timer);
    const responseTime = Math.round(performance.now() - start);
    const statusCode = response.status;

    // Check keyword if configured
    if (keyword && keywordType) {
      const text = await response.text();
      const contains = text.includes(keyword);
      if (keywordType === 'CONTAINS' && !contains) {
        return { status: 'DOWN', responseTime, statusCode, error: `Keyword "${keyword}" not found in response` };
      }
      if (keywordType === 'NOT_CONTAINS' && contains) {
        return { status: 'DOWN', responseTime, statusCode, error: `Keyword "${keyword}" found in response (should not contain)` };
      }
    }

    // Check status code
    if (statusCode !== expectedStatus) {
      return { status: 'DOWN', responseTime, statusCode, error: `Expected status ${expectedStatus}, got ${statusCode}` };
    }

    // Degraded if slow
    if (responseTime > 5000) {
      return { status: 'DEGRADED', responseTime, statusCode };
    }

    return { status: 'UP', responseTime, statusCode };
  } catch (err: any) {
    const responseTime = Math.round(performance.now() - start);
    let error = err.message || 'Unknown error';

    if (err.name === 'AbortError') {
      error = `Timeout after ${timeout}ms`;
    } else if (err.cause?.code === 'ECONNREFUSED') {
      error = 'Connection refused';
    } else if (err.cause?.code === 'ENOTFOUND') {
      error = 'DNS resolution failed';
    }

    return { status: 'DOWN', responseTime, statusCode: 0, error };
  }
}
