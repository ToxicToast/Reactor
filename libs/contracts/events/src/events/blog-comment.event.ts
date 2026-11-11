import type { BlogCommentEvents, BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogCommentPayloadV1 } from '../payloads/index.js';

export type BlogCommentEventV2 = EventEnvelope<
  typeof BlogTopics.COMMENT,
  (typeof BlogCommentEvents)[keyof typeof BlogCommentEvents],
  BlogCommentPayloadV1
>;
