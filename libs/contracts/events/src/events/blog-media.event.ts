import type { BlogMediaEvents, BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogMediaPayloadV1 } from '../payloads/index.js';

export type BlogMediaEventV2 = EventEnvelope<
  typeof BlogTopics.MEDIA,
  (typeof BlogMediaEvents)[keyof typeof BlogMediaEvents],
  BlogMediaPayloadV1
>;
