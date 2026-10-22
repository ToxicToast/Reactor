import { Global, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { MetricsModule } from '../modules/metrics.module.js';
import { MetricsController } from './metrics.controller.js';

const controllerWith = async (
  outbox: boolean,
  query = jest.fn().mockResolvedValue([{ count: '3', oldest_seconds: '42.5' }]),
): Promise<MetricsController> => {
  @Global()
  @Module({
    providers: [{ provide: DataSource, useValue: { query } }],
    exports: [DataSource],
  })
  class FakeDataSourceModule {}

  const moduleRef = await Test.createTestingModule({
    imports: [FakeDataSourceModule, MetricsModule.forRoot({ outbox })],
  }).compile();
  await moduleRef.init();
  return moduleRef.get(MetricsController);
};

describe('MetricsController', () => {
  it('exposes the default node metrics', async () => {
    const controller = await controllerWith(false);

    const metrics = await controller.metrics();

    expect(metrics).toContain('process_cpu_user_seconds_total');
    expect(metrics).not.toContain('outbox_unpublished_events');
  });

  it('exposes outbox metrics when enabled', async () => {
    const controller = await controllerWith(true);

    const metrics = await controller.metrics();

    expect(metrics).toContain('outbox_unpublished_events 3');
    expect(metrics).toContain('outbox_oldest_unpublished_seconds 42.5');
  });

  it('reports an empty outbox as zero', async () => {
    const controller = await controllerWith(
      true,
      jest.fn().mockResolvedValue([{ count: '0', oldest_seconds: null }]),
    );

    const metrics = await controller.metrics();

    expect(metrics).toContain('outbox_unpublished_events 0');
    expect(metrics).toContain('outbox_oldest_unpublished_seconds 0');
  });
});
