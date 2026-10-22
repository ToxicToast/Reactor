import type { BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogTagPayloadV1 } from '../payloads/index.js';

export type BlogTagEventV1 = EventEnvelope<
  typeof BlogTopics.TAG,
  'create' | 'update' | 'delete' | 'restore',
  BlogTagPayloadV1
>;
