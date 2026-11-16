import { AuditActorType, type AuditEvent } from '@toxictoast/contracts-grpc';
import { AUDIT_ACTOR_TYPE_NAMES } from '../constants/index.js';
import type { AuditEventView } from '../interfaces/index.js';

const parsePayload = (json: string): unknown => {
  try {
    return JSON.parse(json);
  } catch {
    return { unparsable: json };
  }
};

export const auditEventView = (event: AuditEvent): AuditEventView => {
  const type = event.actor?.type ?? AuditActorType.AUDIT_ACTOR_TYPE_UNKNOWN;
  return {
    event_id: event.event_id,
    event_namespace: event.event_namespace,
    event_name: event.event_name,
    event_version: event.event_version,
    aggregate_id: event.aggregate_id,
    occurred_at: event.occurred_at,
    actor: {
      type: AUDIT_ACTOR_TYPE_NAMES[type] ?? type,
      id: event.actor?.id,
      ip: event.actor?.ip,
    },
    correlation_id: event.correlation_id,
    payload: parsePayload(event.payload_json),
    recorded_at: event.recorded_at,
  };
};
