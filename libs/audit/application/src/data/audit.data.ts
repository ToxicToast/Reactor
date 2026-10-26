import type { AuditEntry, AuditFilter } from '@toxictoast/audit-domain';

export type RecordAuditEventInput = Omit<AuditEntry, 'recorded_at'>;

export type ListAuditEventsInput = AuditFilter;

export interface PurgeExpiredAuditEventsOutput {
  readonly removed: number;
}
