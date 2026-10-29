import { Module } from '@nestjs/common';
import {
  TWITCH_EVENT_TOPICS,
  TWITCH_TOPIC_RETENTION_MS,
  TwitchStatsTopics,
} from '@toxictoast/contracts-events';
import { FALLBACK_HANDLER } from '@toxictoast/shared-messaging';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  RedisModule,
  SystemModule,
  WebhooksModule,
} from '@toxictoast/shared-nest';
import { TwitchEventHandler } from '@toxictoast/twitch-api';
import {
  twitchMigrations,
  twitchSchemas,
} from '@toxictoast/twitch-infrastructure';
import { TwitchModule } from './twitch.module.js';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: twitchSchemas,
      migrations: twitchMigrations,
    }),
    RedisModule.forRoot({ subscriber: true }),
    WebhooksModule.forRoot({ secretKeyEnv: 'WEBHOOK_SECRET_KEY' }),
    MessagingModule.forRoot({
      groupId: 'twitch-service',
      imports: [TwitchModule],
      handlers: {
        inject: [TwitchEventHandler],
        useFactory: (handler: TwitchEventHandler) => {
          return {
            [FALLBACK_HANDLER]: (event) => handler.handle(event),
          };
        },
      },
      topics: [...Object.values(TwitchStatsTopics)],
      consumeTopics: TWITCH_EVENT_TOPICS,
      topicRetentionMs: TWITCH_TOPIC_RETENTION_MS,
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true, consumer: true }),
    TwitchModule,
  ],
})
export class AppModule {}
