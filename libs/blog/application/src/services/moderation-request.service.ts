import type { CommentAnemic } from '@toxictoast/blog-domain';
import type { DomainContext, DomainEvent } from '@toxictoast/shared-kernel';
import type { ModerationRequestedPayload } from '../data/index.js';

export class ModerationRequestService {
  constructor(private readonly ctx: DomainContext) {}

  forComment(comment: CommentAnemic): DomainEvent<ModerationRequestedPayload> {
    return {
      event_id: this.ctx.id.generate<'Event'>(),
      event_namespace: 'moderation',
      event_name: 'requested',
      event_version: 1,
      aggregate_id: comment.id,
      occurred_at: this.ctx.date.now(),
      payload: {
        subject_type: 'blog.comment',
        subject_id: comment.id,
        author_id: comment.author_id,
        content: comment.content,
      },
    };
  }
}
