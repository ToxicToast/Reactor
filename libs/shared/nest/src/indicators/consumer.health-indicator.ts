import { Inject, Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import type { KafkaEventConsumer } from '@toxictoast/shared-messaging';
import type { Nullable } from '@toxictoast/shared-types';
import { TOKENS } from '../constants/index.js';

@Injectable()
export class ConsumerHealthIndicator {
  constructor(
    @Inject(TOKENS.EVENT_CONSUMER)
    private readonly consumer: Nullable<KafkaEventConsumer>,
    private readonly health: HealthIndicatorService,
  ) {}

  isHealthy(key = 'consumer'): HealthIndicatorResult {
    const indicator = this.health.check(key);
    if (!this.consumer || this.consumer.isCaughtUp) {
      return indicator.up();
    }
    return indicator.down({ message: 'replaying events' });
  }
}
