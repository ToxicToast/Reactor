export const CORS_HEADERS = {
  ALLOWED: ['Authorization', 'Content-Type', 'X-Correlation-Id'],
  EXPOSED: ['X-Correlation-Id', 'Retry-After'],
} as const;
