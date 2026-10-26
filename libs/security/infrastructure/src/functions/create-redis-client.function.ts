import type { RedisConnection } from '@toxictoast/shared-system';
import { Redis } from 'ioredis';

export const createRedisClient = (connection: RedisConnection): Redis => {
  return new Redis({
    host: connection.host,
    port: connection.port,
    password: connection.password,
    db: connection.db,
    maxRetriesPerRequest: 3,
  });
};
