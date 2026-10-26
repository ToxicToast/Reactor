import type {
  SecurityAccessEvents,
  SecurityTopics,
} from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { AccessDeniedPayloadV1 } from '../payloads/index.js';

export type AccessDeniedEventV1 = EventEnvelope<
  typeof SecurityTopics.ACCESS,
  typeof SecurityAccessEvents.DENIED,
  AccessDeniedPayloadV1
>;
