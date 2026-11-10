import { Module, type DynamicModule, type Provider } from '@nestjs/common';
import {
  createRedisClient,
  redisConnectionFromEnv,
} from '@toxictoast/shared-system';
import type { Redis } from 'ioredis';
import { TOKENS } from '../constants/index.js';
import type { RedisModuleOptions } from '../interfaces/index.js';
import { RedisLifecycle } from '../lifecycles/index.js';

const clientProvider = (token: symbol): Provider => {
  return {
    provide: token,
    useFactory: (): Redis => createRedisClient(redisConnectionFromEnv()),
  };
};

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions = {}): DynamicModule {
    const tokens =
      options.subscriber === true
        ? [TOKENS.REDIS, TOKENS.REDIS_SUBSCRIBER]
        : [TOKENS.REDIS];

    return {
      module: RedisModule,
      global: true,
      providers: [
        ...tokens.map(clientProvider),
        {
          provide: RedisLifecycle,
          inject: tokens,
          useFactory: (...clients: Array<Redis>) => {
            return new RedisLifecycle(clients);
          },
        },
      ],
      exports: tokens,
    };
  }
}
