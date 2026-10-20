import type {
  BlogCommentModerationEvents,
  BlogTopics,
} from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { ModerationDecidedPayloadV1 } from '../payloads/index.js';

export type ModerationDecidedEventV1 = EventEnvelope<
  typeof BlogTopics.COMMENT_MODERATION,
  typeof BlogCommentModerationEvents.DECIDED,
  ModerationDecidedPayloadV1
>;
