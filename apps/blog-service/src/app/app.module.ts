import { Module } from '@nestjs/common';
import {
  ModerationDecidedHandler,
  PostMediaHandler,
} from '@toxictoast/blog-api';
import { blogMigrations, blogSchemas } from '@toxictoast/blog-infrastructure';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  StorageModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { BlogPostEvents, BlogTopics } from '@toxictoast/contracts-events';
import { BlogModule } from './blog.module.js';
import { eventKey } from '@toxictoast/shared-kernel';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: blogSchemas,
      migrations: blogMigrations,
    }),
    StorageModule,
    MessagingModule.forRoot({
      groupId: 'blog-service',
      imports: [BlogModule],
      handlers: {
        inject: [ModerationDecidedHandler, PostMediaHandler],
        useFactory: (
          moderation: ModerationDecidedHandler,
          postMedia: PostMediaHandler,
        ) => {
          return {
            'blog.comment.moderation.decided': (event) =>
              moderation.handle(event.payload),
            ...Object.fromEntries(
              Object.values(BlogPostEvents).map((name) => {
                return [
                  eventKey(BlogTopics.POST, name),
                  (event: { payload: unknown }) =>
                    postMedia.handle(event.payload),
                ];
              }),
            ),
          };
        },
      },
      topics: [...Object.values(BlogTopics)],
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true, consumer: true }),
    BlogModule,
  ],
})
export class AppModule {}
