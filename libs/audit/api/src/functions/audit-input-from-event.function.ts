import type { RecordAuditEventInput } from '@toxictoast/audit-application';
import {
  isActorIdentity,
  isUuid,
  readPayload,
  type Result,
} from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import { AUDIT_EVENT_LIMITS, UNKNOWN_ACTOR_TYPE } from '../constants/index.js';

const fitting = (value: Nullable<string>, max: number): Nullable<string> => {
  if (value === null || value.length > max) {
    return null;
  }
  return value;
};

/** Pflichtfelder müssen passen; Actor und Correlation-ID dürfen fehlen oder kaputt sein, das Event bleibt sichtbar. */
export const auditInputFromEvent = (
  event: unknown,
): Result<RecordAuditEventInput> => {
  return readPayload(event, (reader) => {
    const actorValue = reader.value('actor');
    const actor = isActorIdentity(actorValue) ? actorValue : null;
    const correlationId = reader.value('correlation_id');

    return {
      event_id: reader.uuid('event_id'),
      event_namespace: reader.boundedString(
        'event_namespace',
        AUDIT_EVENT_LIMITS.NAMESPACE_LENGTH,
      ),
      event_name: reader.boundedString(
        'event_name',
        AUDIT_EVENT_LIMITS.NAME_LENGTH,
      ),
      event_version: reader.integer('event_version'),
      aggregate_id: reader.boundedString(
        'aggregate_id',
        AUDIT_EVENT_LIMITS.AGGREGATE_ID_LENGTH,
      ),
      occurred_at: reader.date('occurred_at'),
      actor_type: actor?.type ?? UNKNOWN_ACTOR_TYPE,
      actor_id: actor
        ? fitting(actor.id, AUDIT_EVENT_LIMITS.ACTOR_ID_LENGTH)
        : null,
      actor_ip: actor ? fitting(actor.ip, AUDIT_EVENT_LIMITS.IP_LENGTH) : null,
      correlation_id: isUuid(correlationId)
        ? correlationId.toLowerCase()
        : null,
      payload: reader.record('payload').object,
    };
  });
};
