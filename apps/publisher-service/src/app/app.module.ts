import { Module } from '@nestjs/common';
import {
  SOCIAL_TOPIC_RETENTION_MS,
  SocialAccountEvents,
  SocialPostEvents,
  SocialTopics,
} from '@toxictoast/contracts-events';
import {
  SocialAccountHandler,
  SocialPostHandler,
} from '@toxictoast/publisher-api';
import {
  publisherMigrations,
  publisherSchemas,
} from '@toxictoast/publisher-infrastructure';
import { eventKey } from '@toxictoast/shared-kernel';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { PublisherModule } from './publisher.module.js';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: publisherSchemas,
      migrations: publisherMigrations,
    }),
    MessagingModule.forRoot({
      groupId: 'publisher-service',
      imports: [PublisherModule],
      handlers: {
        inject: [SocialAccountHandler, SocialPostHandler],
        useFactory: (
          accounts: SocialAccountHandler,
          posts: SocialPostHandler,
        ) => {
          return {
            [eventKey(SocialTopics.ACCOUNT, SocialAccountEvents.OBSERVED)]: (
              event,
            ) => accounts.handleObserved(event),
            [eventKey(SocialTopics.POST, SocialPostEvents.OBSERVED)]: (event) =>
              posts.handleObserved(event),
            [eventKey(SocialTopics.POST, SocialPostEvents.CHECK_FAILED)]: (
              event,
            ) => posts.handleCheckFailed(event),
          };
        },
      },
      topics: [...Object.values(SocialTopics)],
      topicRetentionMs: SOCIAL_TOPIC_RETENTION_MS,
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true, consumer: true }),
    PublisherModule,
  ],
})
export class AppModule {}
