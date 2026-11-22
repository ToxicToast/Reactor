import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { errorMessage } from '@toxictoast/shared-system';
import type { Redis } from 'ioredis';
import { HEALTH, TOKENS } from '../constants/index.js';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    @Inject(TOKENS.REDIS) private readonly redis: Redis,
    private readonly health: HealthIndicatorService,
  ) {}

  /** Erst der Status, dann PING – sonst hängt der Check, solange ioredis neu verbindet. */
  async isHealthy(
    key: string = HEALTH.REDIS_KEY,
  ): Promise<HealthIndicatorResult> {
    const indicator = this.health.check(key);
    if (this.redis.status !== HEALTH.REDIS_READY_STATUS) {
      return indicator.down({ message: `connection is ${this.redis.status}` });
    }
    try {
      await this.redis.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: errorMessage(error) });
    }
  }
}
