import type { BlogTopics } from '../constants/index.js';
import type { EventEnvelope } from '../interfaces/index.js';
import type { BlogPostPayloadV1 } from '../payloads/index.js';

export type BlogPostEventV1 = EventEnvelope<
  typeof BlogTopics.POST,
  | 'create'
  | 'update'
  | 'publish'
  | 'archive'
  | 'unarchive'
  | 'delete'
  | 'restore',
  BlogPostPayloadV1
>;
