import { Module } from '@nestjs/common';
import {
  SHORTENER_TOPIC_RETENTION_MS,
  ShortenerClickEvents,
  ShortenerTopics,
} from '@toxictoast/contracts-events';
import { eventKey } from '@toxictoast/shared-kernel';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { LinkClickHandler } from '@toxictoast/shortener-api';
import {
  shortenerMigrations,
  shortenerSchemas,
} from '@toxictoast/shortener-infrastructure';
import { ShortenerModule } from './shortener.module.js';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: shortenerSchemas,
      migrations: shortenerMigrations,
    }),
    MessagingModule.forRoot({
      groupId: 'shortener-service',
      imports: [ShortenerModule],
      handlers: {
        inject: [LinkClickHandler],
        useFactory: (clicks: LinkClickHandler) => {
          return {
            [eventKey(ShortenerTopics.CLICK, ShortenerClickEvents.CLICKED)]: (
              event,
            ) => clicks.handle(event),
          };
        },
      },
      topics: [...Object.values(ShortenerTopics)],
      topicRetentionMs: SHORTENER_TOPIC_RETENTION_MS,
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true, consumer: true }),
    ShortenerModule,
  ],
})
export class AppModule {}
