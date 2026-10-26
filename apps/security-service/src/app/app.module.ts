import { Module } from '@nestjs/common';
import {
  SECURITY_TOPIC_RETENTION_MS,
  SecurityTopics,
} from '@toxictoast/contracts-events';
import { AccessDeniedHandler } from '@toxictoast/security-api';
import {
  securityMigrations,
  securitySchemas,
} from '@toxictoast/security-infrastructure';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { SecurityModule } from './security.module.js';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot({
      schemas: securitySchemas,
      migrations: securityMigrations,
    }),
    MessagingModule.forRoot({
      groupId: 'security-service',
      imports: [SecurityModule],
      handlers: {
        inject: [AccessDeniedHandler],
        useFactory: (handler: AccessDeniedHandler) => {
          return {
            'security.access.denied': (event) => handler.handle(event.payload),
          };
        },
      },
      topics: [...Object.values(SecurityTopics)],
      topicRetentionMs: SECURITY_TOPIC_RETENTION_MS,
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: true, consumer: true }),
    SecurityModule,
  ],
})
export class AppModule {}
