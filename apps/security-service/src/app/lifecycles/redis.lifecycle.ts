import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { describeError } from '@toxictoast/shared-system';
import type { Redis } from 'ioredis';
import { SECURITY_TOKENS } from '../constants/index.js';

@Injectable()
export class RedisLifecycle implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger('Redis');

  constructor(@Inject(SECURITY_TOKENS.REDIS) private readonly redis: Redis) {}

  onModuleInit(): void {
    this.redis.on('error', (error: unknown) => {
      this.logger.error('Redis connection failed', describeError(error));
    });
  }

  async onApplicationShutdown(): Promise<void> {
    await this.redis.quit();
  }
}
