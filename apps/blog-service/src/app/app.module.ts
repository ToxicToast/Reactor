import { Module } from '@nestjs/common';
import { ModerationDecidedHandler } from '@toxictoast/blog-api';
import { blogMigrations, blogSchemas } from '@toxictoast/blog-infrastructure';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  StorageModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { BlogTopics } from '@toxictoast/contracts-events';
import { BlogModule } from './blog.module.js';

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
        inject: [ModerationDecidedHandler],
        useFactory: (handler: ModerationDecidedHandler) => {
          return {
            'blog.comment.moderation.decided': (event) =>
              handler.handle(event.payload),
          };
        },
      },
      topics: [...Object.values(BlogTopics)],
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true }),
    BlogModule,
  ],
})
export class AppModule {}
