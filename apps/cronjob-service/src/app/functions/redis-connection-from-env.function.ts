import { numberEnv, optionalEnv } from '@toxictoast/shared-system';
import type { ConnectionOptions } from 'bullmq';

export const redisConnectionFromEnv = (
  source: NodeJS.ProcessEnv = process.env,
): ConnectionOptions => {
  return {
    host: optionalEnv('REDIS_HOST', undefined, source) ?? 'localhost',
    port: numberEnv('REDIS_PORT', 6379, source),
    password: optionalEnv('REDIS_PASSWORD', undefined, source),
    db: numberEnv('REDIS_DB', 0, source),
  };
};
