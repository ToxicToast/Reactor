import type {
  BlogCommentModerationEvents,
  BlogTopics,
} from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogCommentPayloadV1 } from '../payloads/index.js';

export type ModerationRequestedEventV1 = EventEnvelope<
  typeof BlogTopics.COMMENT_MODERATION,
  typeof BlogCommentModerationEvents.REQUESTED,
  BlogCommentPayloadV1
>;
