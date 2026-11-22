import {
  Logger,
  Module,
  type DynamicModule,
  type Provider,
} from '@nestjs/common';
import type { Clock } from '@toxictoast/shared-kernel';
import {
  createKafkaAdmin,
  createKafkaConsumer,
  createKafkaProducer,
  KafkaEventConsumer,
  KafkaEventPublisher,
  kafkaConfigFromEnv,
  OutboxRelay,
  TopicProvisioner,
  type EventPublisher,
  type StringProducer,
  MESSAGING_ENV,
  MESSAGING_DEFAULTS,
} from '@toxictoast/shared-messaging';
import {
  ActorContext,
  booleanEnv,
  describeError,
  numberEnv,
  CorrelationContext,
  PollingWorker,
} from '@toxictoast/shared-system';
import type { Nullable } from '@toxictoast/shared-types';
import { DataSource } from 'typeorm';
import { TOKENS } from '../constants/index.js';
import type { MessagingModuleOptions } from '../interfaces/index.js';
import { MessagingLifecycle } from '../lifecycles/index.js';
import { AdvisoryLock } from '@toxictoast/shared-persistence';

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
          new AdvisoryLock(dataSource),
          publisher,
          clock,
          numberEnv(
            MESSAGING_ENV.OUTBOX_BATCH_SIZE,
            MESSAGING_DEFAULTS.OUTBOX_BATCH_SIZE,
          ),
        );
      },
    },
    {
      provide: TOKENS.OUTBOX_RELAY_WORKER,
      inject: [OutboxRelay],
      useFactory: (relay: OutboxRelay) => {
        return new PollingWorker(relay, {
          intervalMs: numberEnv(
            MESSAGING_ENV.OUTBOX_INTERVAL_MS,
            MESSAGING_DEFAULTS.OUTBOX_INTERVAL_MS,
          ),
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
                topics: options.consumeTopics,
                replay: options.replay,
                onError: (error, event) => {
                  const name = event
                    ? `Handling ${event.event_namespace}.${event.event_name} failed`
                    : 'Event consumer failed';
                  logger.error(name, describeError(error));
                },
                onRestart: (restarts) => {
                  logger.warn(
                    `Event consumer restarted (${restarts} restarts so far)`,
                  );
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
            if (
              !booleanEnv(
                MESSAGING_ENV.AUTO_CREATE_TOPICS,
                MESSAGING_DEFAULTS.AUTO_CREATE_TOPICS,
              )
            ) {
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
                partitions: numberEnv(
                  MESSAGING_ENV.TOPIC_PARTITIONS,
                  MESSAGING_DEFAULTS.TOPIC_PARTITIONS,
                ),
                replicas: numberEnv(
                  MESSAGING_ENV.TOPIC_REPLICAS,
                  MESSAGING_DEFAULTS.TOPIC_REPLICAS,
                ),
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
