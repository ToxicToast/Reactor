import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { PostAnemic } from '../anemics/index.js';

export class CreatePostEvent implements DomainEvent<PostAnemic> {
  readonly event_namespace = 'blog.post';
  readonly event_name = 'create';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: PostAnemic,
  ) {}
}
