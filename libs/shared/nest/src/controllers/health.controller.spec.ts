import {
  ConsoleLogger,
  Global,
  Module,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthModule } from '../modules/health.module.js';
import { HealthController } from './health.controller.js';

const withDataSource = (query: jest.Mock) => {
  @Global()
  @Module({
    providers: [{ provide: DataSource, useValue: { query } }],
    exports: [DataSource],
  })
  class FakeDataSourceModule {}

  return FakeDataSourceModule;
};

const controllerWith = async (
  database: boolean,
  query = jest.fn().mockResolvedValue([{ '?column?': 1 }]),
): Promise<HealthController> => {
  const moduleRef = await Test.createTestingModule({
    imports: [withDataSource(query), HealthModule.forRoot({ database })],
  }).compile();
  return moduleRef.get(HealthController);
};

describe('HealthController', () => {
  beforeEach(() => {
    jest.spyOn(ConsoleLogger.prototype, 'error').mockImplementation(() => {
      return undefined;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports live without checking the database', async () => {
    const query = jest.fn().mockRejectedValue(new Error('down'));
    const controller = await controllerWith(true, query);

    const result = await controller.live();

    expect(result.status).toBe('ok');
    expect(query).not.toHaveBeenCalled();
  });

  it('reports ready when the database answers', async () => {
    const controller = await controllerWith(true);

    const result = await controller.ready();

    expect(result.status).toBe('ok');
    expect(result.details).toHaveProperty('database.status', 'up');
  });

  it('fails ready with 503 when the database is down', async () => {
    const query = jest.fn().mockRejectedValue(new Error('connection refused'));
    const controller = await controllerWith(true, query);

    await expect(controller.ready()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('reports ready without database checks when disabled', async () => {
    const query = jest.fn().mockRejectedValue(new Error('down'));
    const controller = await controllerWith(false, query);

    const result = await controller.ready();

    expect(result.status).toBe('ok');
    expect(query).not.toHaveBeenCalled();
  });
});
