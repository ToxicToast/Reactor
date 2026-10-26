import type { RecordAuditEventInput } from '@toxictoast/audit-application';
import { isActorIdentity, isUuid } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import { UNKNOWN_ACTOR_TYPE } from '../constants/index.js';
import type { AuditableEvent } from '../interfaces/index.js';

const MAX_ACTOR_ID_LENGTH = 64;
const MAX_IP_LENGTH = 45;

const fitting = (value: Nullable<string>, max: number): Nullable<string> => {
  if (value === null || value.length > max) {
    return null;
  }
  return value;
};

export const auditInputFromEvent = (
  event: AuditableEvent,
): RecordAuditEventInput => {
  const actor = isActorIdentity(event.actor) ? event.actor : null;
  return {
    event_id: event.event_id.toLowerCase(),
    event_namespace: event.event_namespace,
    event_name: event.event_name,
    event_version: event.event_version,
    aggregate_id: event.aggregate_id,
    occurred_at: new Date(event.occurred_at),
    actor_type: actor?.type ?? UNKNOWN_ACTOR_TYPE,
    actor_id: actor ? fitting(actor.id, MAX_ACTOR_ID_LENGTH) : null,
    actor_ip: actor ? fitting(actor.ip, MAX_IP_LENGTH) : null,
    correlation_id: isUuid(event.correlation_id)
      ? event.correlation_id.toLowerCase()
      : null,
    payload: event.payload,
  };
};
