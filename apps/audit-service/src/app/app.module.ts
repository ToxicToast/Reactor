import { Module } from '@nestjs/common';
import { AuditEventHandler } from '@toxictoast/audit-api';
import {
  auditMigrations,
  auditSchemas,
} from '@toxictoast/audit-infrastructure';
import {
  EVENT_TOPICS,
  SECURITY_TOPIC_RETENTION_MS,
} from '@toxictoast/contracts-events';
import {
  HealthModule,
  MessagingModule,
  MetricsModule,
  PersistenceModule,
  SystemModule,
} from '@toxictoast/shared-nest';
import { AuditModule } from './audit.module.js';

@Module({
  imports: [
    SystemModule,
    PersistenceModule.forRoot(
      { schemas: auditSchemas, migrations: auditMigrations },
      { outbox: false },
    ),
    MessagingModule.forRoot({
      groupId: 'audit-service',
      outbox: false,
      imports: [AuditModule],
      handlers: {
        inject: [AuditEventHandler],
        useFactory: (handler: AuditEventHandler) => {
          return {
            '*': (event) => handler.handle(event),
          };
        },
      },
      consumeTopics: EVENT_TOPICS,
      topicRetentionMs: SECURITY_TOPIC_RETENTION_MS,
    }),
    HealthModule.forRoot({ database: true }),
    MetricsModule.forRoot({ outbox: false, consumer: true }),
    AuditModule,
  ],
})
export class AppModule {}
