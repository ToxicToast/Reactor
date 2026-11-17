import { REDIS_DEFAULTS, REDIS_ENV } from '../constants/index.js';
import type { RedisConnection } from '../interfaces/index.js';
import { numberEnv } from './number-env.function.js';
import { optionalEnv } from './optional-env.function.js';

export const redisConnectionFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): RedisConnection => {
  return {
    host: optionalEnv(REDIS_ENV.HOST, undefined, source) ?? REDIS_DEFAULTS.HOST,
    port: numberEnv(REDIS_ENV.PORT, REDIS_DEFAULTS.PORT, source),
    password: optionalEnv(REDIS_ENV.PASSWORD, undefined, source),
    db: numberEnv(REDIS_ENV.DB, REDIS_DEFAULTS.DB, source),
  };
};
