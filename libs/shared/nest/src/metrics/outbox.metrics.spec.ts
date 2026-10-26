import { Registry } from 'prom-client';
import type { DataSource } from 'typeorm';
import { OutboxMetrics } from './outbox.metrics.js';

describe('OutboxMetrics', () => {
  let query: jest.Mock;
  let registry: Registry;

  beforeEach(() => {
    query = jest.fn();
    registry = new Registry();
    new OutboxMetrics(registry, {
      query,
    } as unknown as DataSource).onModuleInit();
  });

  it('reports the number and age of unpublished events', async () => {
    query.mockResolvedValue([{ count: '4', oldest_seconds: '12.5' }]);

    const output = await registry.metrics();

    expect(output).toContain('outbox_unpublished_events 4');
    expect(output).toContain('outbox_oldest_unpublished_seconds 12.5');
  });

  it('reports zero when the outbox is empty', async () => {
    query.mockResolvedValue([{ count: '0', oldest_seconds: null }]);

    const output = await registry.metrics();

    expect(output).toContain('outbox_unpublished_events 0');
    expect(output).toContain('outbox_oldest_unpublished_seconds 0');
  });
});
