import {
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
} from '@nestjs/common';
import { describeError } from '@toxictoast/shared-system';
import type { Redis } from 'ioredis';

export class RedisLifecycle implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger('Redis');

  constructor(private readonly clients: ReadonlyArray<Redis>) {}

  onModuleInit(): void {
    for (const client of this.clients) {
      client.on('error', (error: unknown) => {
        this.logger.error('Redis connection failed', describeError(error));
      });
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await Promise.all(this.clients.map((client) => client.quit()));
  }
}
