export const REDIS_ENV = {
  HOST: 'REDIS_HOST',
  PORT: 'REDIS_PORT',
  PASSWORD: 'REDIS_PASSWORD',
  DB: 'REDIS_DB',
} as const;

export const REDIS_DEFAULTS = {
  HOST: 'localhost',
  PORT: 6379,
  DB: 0,
  MAX_RETRIES_PER_REQUEST: 3,
} as const;
