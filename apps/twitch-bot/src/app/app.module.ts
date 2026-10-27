import { Module } from '@nestjs/common';
import {
  TWITCH_TOPIC_RETENTION_MS,
  TwitchTopics,
} from '@toxictoast/contracts-events';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import {
  twitchBotMigrations,
  twitchBotSchemas,
} from '@toxictoast/twitch-bot-infrastructure';
import { TwitchReadinessProbe } from './probes/index.js';
import { TwitchBotModule } from './twitch-bot.module.js';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: twitchBotSchemas,
      migrations: twitchBotMigrations,
    }),
    MessagingModule.forRoot({
      groupId: 'twitch-bot',
      topics: [...Object.values(TwitchTopics)],
      topicRetentionMs: TWITCH_TOPIC_RETENTION_MS,
    }),
    HealthModule.forRoot({
      database: true,
      probes: {
        imports: [TwitchBotModule],
        inject: [TwitchReadinessProbe],
        useFactory: (twitch: TwitchReadinessProbe) => [twitch],
      },
    }),
    MetricsModule.forRoot({ outbox: true, consumer: false }),
    TwitchBotModule,
  ],
})
export class AppModule {}
