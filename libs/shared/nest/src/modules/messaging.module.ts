import { Logger, Module, type DynamicModule } from '@nestjs/common';
import type { Producer } from '@platformatic/kafka';
import type { Clock } from '@toxictoast/shared-kernel';
import {
  createKafkaConsumer,
  createKafkaProducer,
  KafkaEventConsumer,
  KafkaEventPublisher,
  kafkaConfigFromEnv,
  OutboxRelay,
  OutboxRelayWorker,
  type EventPublisher,
} from '@toxictoast/shared-messaging';
import { describeError, numberEnv } from '@toxictoast/shared-system';
import { DataSource } from 'typeorm';
import { TOKENS } from '../constants/index.js';
import type { MessagingModuleOptions } from '../interfaces/index.js';
import { MessagingLifecycle } from '../lifecycles/index.js';

type StringProducer = Producer<string, string, string, string>;

@Module({})
export class MessagingModule {
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    const logger = new Logger('Messaging');
    const handlers = options.handlers;

    return {
      module: MessagingModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        {
          provide: TOKENS.KAFKA_PRODUCER,
          useFactory: (): StringProducer => {
            return createKafkaProducer(kafkaConfigFromEnv());
          },
        },
        {
          provide: TOKENS.EVENT_PUBLISHER,
          inject: [TOKENS.KAFKA_PRODUCER],
          useFactory: (producer: StringProducer): EventPublisher => {
            return new KafkaEventPublisher(producer);
          },
        },
        {
          provide: OutboxRelay,
          inject: [DataSource, TOKENS.EVENT_PUBLISHER, TOKENS.CLOCK],
          useFactory: (
            dataSource: DataSource,
            publisher: EventPublisher,
            clock: Clock,
          ) => {
            return new OutboxRelay(
              dataSource,
              publisher,
              clock,
              numberEnv('OUTBOX_BATCH_SIZE', 100),
            );
          },
        },
        {
          provide: OutboxRelayWorker,
          inject: [OutboxRelay],
          useFactory: (relay: OutboxRelay) => {
            return new OutboxRelayWorker(relay, {
              intervalMs: numberEnv('OUTBOX_INTERVAL_MS', 500),
              onError: (error) => {
                logger.error('Outbox relay failed', describeError(error));
              },
            });
          },
        },
        {
          provide: TOKENS.EVENT_CONSUMER,
          inject: handlers?.inject ?? [],
          useFactory: (...deps: Array<unknown>) => {
            if (!handlers) {
              return null;
            }
            return new KafkaEventConsumer(
              createKafkaConsumer(kafkaConfigFromEnv(), options.groupId),
              {
                handlers: handlers.useFactory(...deps),
                onError: (error, event) => {
                  const name = event
                    ? `${event.event_namespace}.${event.event_name}`
                    : 'unknown event';
                  logger.error(`Handling ${name} failed`, describeError(error));
                },
              },
            );
          },
        },
        MessagingLifecycle,
      ],
      exports: [TOKENS.EVENT_PUBLISHER],
    };
  }
}
