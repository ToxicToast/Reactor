import { Module } from '@nestjs/common';
import { AuditEventHandler, AuditGrpcController } from '@toxictoast/audit-api';
import {
  ListAuditEventsUseCase,
  PurgeExpiredAuditEventsUseCase,
  RecordAuditEventUseCase,
} from '@toxictoast/audit-application';
import { AuditRetentionPolicy } from '@toxictoast/audit-domain';
import {
  auditRetentionConfigFromEnv,
  TypeOrmAuditRepository,
} from '@toxictoast/audit-infrastructure';
import { provideClass, TOKENS } from '@toxictoast/shared-nest';
import { DataSource } from 'typeorm';
import { AUDIT_TOKENS } from './constants/index.js';

const { AUDIT_REPOSITORY, AUDIT_RETENTION_CONFIG } = AUDIT_TOKENS;
const { CLOCK } = TOKENS;

@Module({
  controllers: [AuditGrpcController],
  providers: [
    // ── Configs ───────────────────────────────
    {
      provide: AUDIT_RETENTION_CONFIG,
      useFactory: () => auditRetentionConfigFromEnv(),
    },

    // ── Domain ──────────────────────────────────
    provideClass(AuditRetentionPolicy, [AUDIT_RETENTION_CONFIG]),

    // ── Infrastructure ──────────────────────────
    provideClass(TypeOrmAuditRepository, [DataSource], AUDIT_REPOSITORY),

    // ── Use Cases ───────────────────────────────
    provideClass(RecordAuditEventUseCase, [AUDIT_REPOSITORY, CLOCK]),
    provideClass(ListAuditEventsUseCase, [AUDIT_REPOSITORY]),
    provideClass(PurgeExpiredAuditEventsUseCase, [
      AUDIT_REPOSITORY,
      AuditRetentionPolicy,
      CLOCK,
    ]),

    AuditEventHandler,
  ],
  exports: [AuditEventHandler],
})
export class AuditModule {}
