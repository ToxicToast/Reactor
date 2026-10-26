import type { AuditEntry } from '@toxictoast/audit-domain';
import type { AuditEventRow } from '../interfaces/index.js';

export class AuditEventMapper {
  toEntry(row: AuditEventRow): AuditEntry {
    return {
      event_id: row.event_id,
      event_namespace: row.event_namespace,
      event_name: row.event_name,
      event_version: row.event_version,
      aggregate_id: row.aggregate_id,
      occurred_at: row.occurred_at,
      actor_type: row.actor_type,
      actor_id: row.actor_id,
      actor_ip: row.actor_ip,
      correlation_id: row.correlation_id,
      payload: row.payload,
      recorded_at: row.recorded_at,
    };
  }

  toRow(entry: AuditEntry): AuditEventRow {
    return {
      event_id: entry.event_id,
      event_namespace: entry.event_namespace,
      event_name: entry.event_name,
      event_version: entry.event_version,
      aggregate_id: entry.aggregate_id,
      occurred_at: entry.occurred_at,
      actor_type: entry.actor_type,
      actor_id: entry.actor_id,
      actor_ip: entry.actor_ip,
      correlation_id: entry.correlation_id,
      payload: entry.payload,
      recorded_at: entry.recorded_at,
    };
  }
}
