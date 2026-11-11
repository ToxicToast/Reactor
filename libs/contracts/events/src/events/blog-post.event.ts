import type { BlogPostEvents, BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogPostPayloadV1 } from '../payloads/index.js';

export type BlogPostEventV2 = EventEnvelope<
  typeof BlogTopics.POST,
  (typeof BlogPostEvents)[keyof typeof BlogPostEvents],
  BlogPostPayloadV1
>;
