import type { MODERATION_TOPIC } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { ModerationRequestedPayloadV1 } from '../payloads/index.js';

export type ModerationRequestedEventV1 = EventEnvelope<
  typeof MODERATION_TOPIC,
  'requested',
  ModerationRequestedPayloadV1
>;
