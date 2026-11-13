import { Module } from '@nestjs/common';
import {
  TWITCH_EVENT_TOPICS,
  TWITCH_TOPIC_RETENTION_MS,
  TwitchStatsTopics,
  WEBHOOK_TOPIC_RETENTION_MS,
  WebhookTopics,
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
  TWITCH_DISCORD_EMBEDS,
  twitchMigrations,
  twitchSchemas,
} from '@toxictoast/twitch-infrastructure';
import { TwitchModule } from './twitch.module.js';
import { DiscordWebhookFormatter } from '@toxictoast/shared-webhooks-infrastructure';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: twitchSchemas,
      migrations: twitchMigrations,
    }),
    RedisModule.forRoot({ subscriber: true }),
    WebhooksModule.forRoot({
      secretKeyEnvPrefix: 'WEBHOOK_SECRET',
      formatters: [new DiscordWebhookFormatter(TWITCH_DISCORD_EMBEDS)],
    }),
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
      topics: [
        ...Object.values(TwitchStatsTopics),
        ...Object.values(WebhookTopics),
      ],
      consumeTopics: TWITCH_EVENT_TOPICS,
      topicRetentionMs: {
        ...TWITCH_TOPIC_RETENTION_MS,
        ...WEBHOOK_TOPIC_RETENTION_MS,
      },
    }),
    HealthModule.forRoot({ database: true, redis: true }),
    MetricsModule.forRoot({ outbox: true, consumer: true }),
    TwitchModule,
  ],
})
export class AppModule {}
