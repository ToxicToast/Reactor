import { Redis } from 'ioredis';
import { REDIS_DEFAULTS } from '../constants/index.js';
import type { RedisConnection } from '../interfaces/index.js';

export const createRedisClient = (connection: RedisConnection): Redis => {
  return new Redis({
    host: connection.host,
    port: connection.port,
    password: connection.password,
    db: connection.db,
    maxRetriesPerRequest: REDIS_DEFAULTS.MAX_RETRIES_PER_REQUEST,
  });
};
