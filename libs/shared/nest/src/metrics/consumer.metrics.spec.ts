import type { KafkaEventConsumer } from '@toxictoast/shared-messaging';
import { Registry } from 'prom-client';
import { ConsumerMetrics } from './consumer.metrics.js';

describe('ConsumerMetrics', () => {
  it('reports state and restarts of the consumer', async () => {
    const registry = new Registry();
    const consumer = {
      isRunning: false,
      isCaughtUp: true,
      restartCount: 3,
    } as unknown as KafkaEventConsumer;

    new ConsumerMetrics(registry, consumer).onModuleInit();
    const output = await registry.metrics();

    expect(output).toContain('kafka_consumer_running 0');
    expect(output).toContain('kafka_consumer_caught_up 1');
    expect(output).toContain('kafka_consumer_restarts_total 3');
  });

  it('registers nothing without a consumer', async () => {
    const registry = new Registry();

    new ConsumerMetrics(registry, null).onModuleInit();

    expect(await registry.metrics()).not.toContain('kafka_consumer');
  });
});
