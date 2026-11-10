import type { BlogTagEvents, BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogTagPayloadV1 } from '../payloads/index.js';

export type BlogTagEventV2 = EventEnvelope<
  typeof BlogTopics.TAG,
  (typeof BlogTagEvents)[keyof typeof BlogTagEvents],
  BlogTagPayloadV1
>;
