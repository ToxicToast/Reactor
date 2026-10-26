import { Inject, Injectable, type OnModuleInit } from '@nestjs/common';
import type { KafkaEventConsumer } from '@toxictoast/shared-messaging';
import type { Nullable } from '@toxictoast/shared-types';
import { Counter, Gauge, Registry } from 'prom-client';
import { TOKENS } from '../constants/index.js';

@Injectable()
export class ConsumerMetrics implements OnModuleInit {
  constructor(
    @Inject(TOKENS.METRICS_REGISTRY) private readonly registry: Registry,
    @Inject(TOKENS.EVENT_CONSUMER)
    private readonly consumer: Nullable<KafkaEventConsumer>,
  ) {}

  onModuleInit(): void {
    const consumer = this.consumer;
    if (!consumer) {
      return;
    }

    new Gauge({
      name: 'kafka_consumer_running',
      help: 'Whether the event consumer is currently consuming (1) or not (0)',
      registers: [this.registry],
      collect() {
        this.set(consumer.isRunning ? 1 : 0);
      },
    });

    new Gauge({
      name: 'kafka_consumer_caught_up',
      help: 'Whether a replaying consumer has read every partition to its end',
      registers: [this.registry],
      collect() {
        this.set(consumer.isCaughtUp ? 1 : 0);
      },
    });

    new Counter({
      name: 'kafka_consumer_restarts_total',
      help: 'Number of times the event consumer restarted itself',
      registers: [this.registry],
      collect() {
        this.reset();
        this.inc(consumer.restartCount);
      },
    });
  }
}
