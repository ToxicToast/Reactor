import {
  type DomainContext,
  type Factory,
  Result,
} from '@toxictoast/shared-kernel';
import type { CommentAnemic } from '../anemics/index.js';
import type { CommentData } from '../data/index.js';
import { CommentDomain } from '../domains/index.js';
import { CommentStatus } from '../enums/index.js';
import { ValidateCommentContent } from '../validations/index.js';

export class CommentFactory implements Factory<
  CommentAnemic,
  CommentDomain,
  CommentData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: CommentAnemic): CommentDomain {
    return new CommentDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: CommentDomain): CommentAnemic {
    return domain.toAnemic();
  }

  createDomain(data: CommentData): Result<CommentDomain> {
    const content = data.content.trim();
    const validation = new ValidateCommentContent(content).validate();
    if (validation.isFailure) {
      return Result.fail(validation.error);
    }

    const domain = new CommentDomain(
      {
        id: this.ctx.id.generate<'Comment'>(),
        post_id: data.post_id,
        parent_id: data.parent_id,
        author_id: data.author_id,
        content,
        status: CommentStatus.PENDING,
        moderation_note: null,
        moderated_by: null,
        moderated_at: null,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.createComment();
    return Result.ok(domain);
  }
}
