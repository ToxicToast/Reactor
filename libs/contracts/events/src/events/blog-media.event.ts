import type { BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogMediaPayloadV1 } from '../payloads/index.js';

export type BlogMediaEventV1 = EventEnvelope<
  typeof BlogTopics.MEDIA,
  'create' | 'update' | 'ready' | 'delete' | 'restore',
  BlogMediaPayloadV1
>;
