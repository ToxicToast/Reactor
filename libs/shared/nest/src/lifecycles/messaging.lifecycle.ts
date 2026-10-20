import {
  Inject,
  Injectable,
  type BeforeApplicationShutdown,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import type { Producer } from '@platformatic/kafka';
import type { Nullable } from '@toxictoast/shared-types';
import {
  OutboxRelayWorker,
  type KafkaEventConsumer,
} from '@toxictoast/shared-messaging';
import { TOKENS } from '../constants/index.js';

@Injectable()
export class MessagingLifecycle
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  constructor(
    private readonly worker: OutboxRelayWorker,
    @Inject(TOKENS.EVENT_CONSUMER)
    private readonly consumer: Nullable<KafkaEventConsumer>,
    @Inject(TOKENS.KAFKA_PRODUCER)
    private readonly producer: Producer<string, string, string, string>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.worker.start();
    if (this.consumer) {
      await this.consumer.start();
    }
  }

  async beforeApplicationShutdown(): Promise<void> {
    if (this.consumer) {
      await this.consumer.stop();
    }
    await this.worker.stop();
    await this.producer.close();
  }
}
