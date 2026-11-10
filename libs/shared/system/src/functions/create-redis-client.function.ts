import { Redis } from 'ioredis';
import type { RedisConnection } from '../interfaces/index.js';

export const createRedisClient = (connection: RedisConnection): Redis => {
  return new Redis({
    host: connection.host,
    port: connection.port,
    password: connection.password,
    db: connection.db,
    maxRetriesPerRequest: 3,
  });
};
