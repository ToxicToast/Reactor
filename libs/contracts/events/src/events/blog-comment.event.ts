import type { BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogCommentPayloadV1 } from '../payloads/index.js';

export type BlogCommentEventV1 = EventEnvelope<
  typeof BlogTopics.COMMENT,
  'create' | 'update' | 'approve' | 'spam' | 'hate' | 'delete' | 'restore',
  BlogCommentPayloadV1
>;
