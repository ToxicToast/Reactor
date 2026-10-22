import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { CommentAnemic } from '../anemics/index.js';

export class ReviewCommentEvent implements DomainEvent<CommentAnemic> {
  readonly event_namespace = 'blog.comment';
  readonly event_name = 'review';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: CommentAnemic,
  ) {}
}
