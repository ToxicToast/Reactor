import {
  ConsoleLogger,
  Global,
  Module,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TOKENS } from '../constants/index.js';
import { HealthModule } from '../modules/health.module.js';
import { HealthController } from './health.controller.js';

const withRedis = (redis: object) => {
  @Global()
  @Module({
    providers: [{ provide: TOKENS.REDIS, useValue: redis }],
    exports: [TOKENS.REDIS],
  })
  class FakeRedisModule {}

  return FakeRedisModule;
};

const controllerWith = async (redis: object): Promise<HealthController> => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      withRedis(redis),
      HealthModule.forRoot({ database: false, redis: true }),
    ],
  }).compile();
  return moduleRef.get(HealthController);
};

describe('HealthController with redis', () => {
  beforeEach(() => {
    jest.spyOn(ConsoleLogger.prototype, 'error').mockImplementation(() => {
      return undefined;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports ready when redis answers', async () => {
    const ping = jest.fn().mockResolvedValue('PONG');
    const controller = await controllerWith({ status: 'ready', ping });

    const result = await controller.ready();

    expect(result.details).toHaveProperty('redis.status', 'up');
    expect(ping).toHaveBeenCalled();
  });

  it('fails ready without pinging while redis reconnects', async () => {
    const ping = jest.fn();
    const controller = await controllerWith({ status: 'reconnecting', ping });

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(ping).not.toHaveBeenCalled();
  });

  it('fails ready when the ping fails', async () => {
    const ping = jest.fn().mockRejectedValue(new Error('NOAUTH'));
    const controller = await controllerWith({ status: 'ready', ping });

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
