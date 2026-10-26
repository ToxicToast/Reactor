import type { RedisConnection } from '../interfaces/index.js';
import { numberEnv } from './number-env.function.js';
import { optionalEnv } from './optional-env.function.js';

export const redisConnectionFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): RedisConnection => {
  return {
    host: optionalEnv('REDIS_HOST', undefined, source) ?? 'localhost',
    port: numberEnv('REDIS_PORT', 6379, source),
    password: optionalEnv('REDIS_PASSWORD', undefined, source),
    db: numberEnv('REDIS_DB', 0, source),
  };
};
