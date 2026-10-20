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
import { BlogTopics, MODERATION_TOPIC } from '@toxictoast/contracts-events';
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
            'moderation.decided': (event) => handler.handle(event.payload),
          };
        },
      },
      topics: [...Object.values(BlogTopics), MODERATION_TOPIC],
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true }),
    BlogModule,
  ],
})
export class AppModule {}
