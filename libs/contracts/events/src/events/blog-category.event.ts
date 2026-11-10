import type { BlogCategoryEvents, BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogCategoryPayloadV1 } from '../payloads/index.js';

export type BlogCategoryEventV2 = EventEnvelope<
  typeof BlogTopics.CATEGORY,
  (typeof BlogCategoryEvents)[keyof typeof BlogCategoryEvents],
  BlogCategoryPayloadV1
>;
