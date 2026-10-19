import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { CommentAnemic } from '../anemics/index.js';

export class UpdateCommentEvent implements DomainEvent<CommentAnemic> {
  readonly event_namespace = 'blog.comment';
  readonly event_name = 'update';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: CommentAnemic,
  ) {}
}
