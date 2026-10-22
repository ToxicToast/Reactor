import {
  Inject,
  Injectable,
  Logger,
  type BeforeApplicationShutdown,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import type { Producer } from '@platformatic/kafka';
import {
  OutboxRelayWorker,
  type KafkaEventConsumer,
  type TopicProvisioner,
} from '@toxictoast/shared-messaging';
import type { Nullable } from '@toxictoast/shared-types';
import { TOKENS } from '../constants/index.js';

@Injectable()
export class MessagingLifecycle
  implements OnApplicationBootstrap, BeforeApplicationShutdown
{
  private readonly logger = new Logger('Messaging');

  constructor(
    private readonly worker: OutboxRelayWorker,
    @Inject(TOKENS.EVENT_CONSUMER)
    private readonly consumer: Nullable<KafkaEventConsumer>,
    @Inject(TOKENS.KAFKA_PRODUCER)
    private readonly producer: Producer<string, string, string, string>,
    @Inject(TOKENS.TOPIC_PROVISIONER)
    private readonly provisioner: Nullable<TopicProvisioner>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.provisioner) {
      const created = await this.provisioner.provision();
      if (created.length > 0) {
        this.logger.log(`Created topics: ${created.join(', ')}`);
      }
    }

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
