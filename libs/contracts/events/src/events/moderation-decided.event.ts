import type { MODERATION_TOPIC } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { ModerationDecidedPayloadV1 } from '../payloads/index.js';

export type ModerationDecidedEventV1 = EventEnvelope<
  typeof MODERATION_TOPIC,
  'decided',
  ModerationDecidedPayloadV1
>;
