import type { FailedAttemptCounter } from '@toxictoast/security-application';
import type { Redis } from 'ioredis';
import {
  FAILED_ATTEMPT_KEY_PREFIX,
  INCREMENT_IN_WINDOW_SCRIPT,
} from '../constants/index.js';

export class RedisFailedAttemptCounter implements FailedAttemptCounter {
  constructor(private readonly redis: Redis) {}

  async increment(ip: string, windowSeconds: number): Promise<number> {
    const count = await this.redis.eval(
      INCREMENT_IN_WINDOW_SCRIPT,
      1,
      this.key(ip),
      windowSeconds,
    );
    return Number(count);
  }

  async reset(ip: string): Promise<void> {
    await this.redis.del(this.key(ip));
  }

  private key(ip: string): string {
    return `${FAILED_ATTEMPT_KEY_PREFIX}${ip}`;
  }
}
