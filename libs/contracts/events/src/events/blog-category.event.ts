import type { BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogCategoryPayloadV1 } from '../payloads/index.js';

export type BlogCategoryEventV1 = EventEnvelope<
  typeof BlogTopics.CATEGORY,
  'create' | 'update' | 'delete' | 'restore',
  BlogCategoryPayloadV1
>;
