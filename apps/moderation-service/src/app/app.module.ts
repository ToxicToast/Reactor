import { Module } from '@nestjs/common';
import {
  BlogCommentModerationEvents,
  BlogTopics,
} from '@toxictoast/contracts-events';
import { ModerationRequestedHandler } from '@toxictoast/moderation-api';
import { eventKey } from '@toxictoast/shared-kernel';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { ModerationModule } from './moderation.module.js';

@Module({
  imports: [
    SystemModule,
    MessagingModule.forRoot({
      groupId: 'moderation-service',
      outbox: false,
      imports: [ModerationModule],
      handlers: {
        inject: [ModerationRequestedHandler],
        useFactory: (handler: ModerationRequestedHandler) => {
          return {
            [eventKey(
              BlogTopics.COMMENT_MODERATION,
              BlogCommentModerationEvents.REQUESTED,
            )]: (event) => handler.handle(event.payload),
          };
        },
      },
    }),
    HealthModule.forRoot({ database: false }),
    MetricsModule.forRoot({ outbox: false, consumer: true }),
    ModerationModule,
  ],
})
export class AppModule {}
