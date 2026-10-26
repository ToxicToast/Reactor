import type { AuditEntry } from '@toxictoast/audit-domain';
import type { AuditEvent } from '@toxictoast/contracts-grpc';

export class AuditEventGrpcMapper {
  toProto(entry: AuditEntry): AuditEvent {
    return {
      event_id: entry.event_id,
      event_namespace: entry.event_namespace,
      event_name: entry.event_name,
      event_version: entry.event_version,
      aggregate_id: entry.aggregate_id,
      occurred_at: entry.occurred_at.toISOString(),
      actor: {
        type: entry.actor_type,
        id: entry.actor_id ?? undefined,
        ip: entry.actor_ip ?? undefined,
      },
      correlation_id: entry.correlation_id ?? undefined,
      payload_json: JSON.stringify(entry.payload),
      recorded_at: entry.recorded_at.toISOString(),
    };
  }
}
