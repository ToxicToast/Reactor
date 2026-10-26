import {
  Logger,
  Module,
  type DynamicModule,
  type Provider,
} from '@nestjs/common';
import type { Producer } from '@platformatic/kafka';
import type { Clock } from '@toxictoast/shared-kernel';
import {
  createKafkaAdmin,
  createKafkaConsumer,
  createKafkaProducer,
  KafkaEventConsumer,
  KafkaEventPublisher,
  kafkaConfigFromEnv,
  OutboxRelay,
  OutboxRelayWorker,
  TopicProvisioner,
  type EventPublisher,
} from '@toxictoast/shared-messaging';
import {
  ActorContext,
  booleanEnv,
  describeError,
  numberEnv,
  CorrelationContext,
} from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import { DataSource } from 'typeorm';
import { TOKENS } from '../constants/index.js';
import type { MessagingModuleOptions } from '../interfaces/index.js';
import { MessagingLifecycle } from '../lifecycles/index.js';

type StringProducer = Producer<string, string, string, string>;

const outboxProviders = (logger: Logger): Array<Provider> => {
  return [
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
      provide: TOKENS.OUTBOX_RELAY_WORKER,
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
  ];
};

@Module({})
export class MessagingModule {
  static forRoot(options: MessagingModuleOptions): DynamicModule {
    const logger = new Logger('Messaging');
    const handlers = options.handlers;
    const outbox: Array<Provider> =
      options.outbox === false
        ? [{ provide: TOKENS.OUTBOX_RELAY_WORKER, useValue: null }]
        : outboxProviders(logger);

    return {
      module: MessagingModule,
      global: true,
      imports: options.imports ?? [],
      providers: [
        {
          provide: TOKENS.KAFKA_PRODUCER,
          useFactory: (): Promise<StringProducer> => {
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
        ...outbox,
        {
          provide: TOKENS.EVENT_CONSUMER,
          inject: [
            ActorContext,
            CorrelationContext,
            ...(handlers?.inject ?? []),
          ],
          useFactory: async (
            actors: ActorContext,
            correlations: CorrelationContext,
            ...deps: Array<unknown>
          ): Promise<Nullable<KafkaEventConsumer>> => {
            if (!handlers) {
              return null;
            }
            return new KafkaEventConsumer(
              await createKafkaConsumer(kafkaConfigFromEnv(), options.groupId),
              actors,
              correlations,
              {
                handlers: handlers.useFactory(...deps),
                replay: options.replay,
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
        {
          provide: TOKENS.TOPIC_PROVISIONER,
          inject: [TOKENS.EVENT_CONSUMER],
          useFactory: async (
            consumer: Nullable<KafkaEventConsumer>,
          ): Promise<Nullable<TopicProvisioner>> => {
            if (!booleanEnv('KAFKA_AUTO_CREATE_TOPICS', true)) {
              return null;
            }
            const topics = [
              ...(options.topics ?? []),
              ...(consumer?.topics ?? []),
            ];
            return new TopicProvisioner(
              await createKafkaAdmin(kafkaConfigFromEnv()),
              topics,
              {
                partitions: numberEnv('KAFKA_TOPIC_PARTITIONS', 3),
                replicas: numberEnv('KAFKA_TOPIC_REPLICAS', 1),
                retentionMs: options.topicRetentionMs,
              },
            );
          },
        },
        MessagingLifecycle,
      ],
      exports: [TOKENS.EVENT_PUBLISHER, TOKENS.EVENT_CONSUMER],
    };
  }
}
