import { Injectable, Logger } from '@nestjs/common';
import { ApplyModerationDecisionUseCase } from '@toxictoast/blog-application';
import type { CommentId } from '@toxictoast/blog-domain';
import { isUuid } from '@toxictoast/shared-kernel';
import { isModerationDecidedPayload } from '../functions/index.js';
import { MODERATION_DECISION_FROM_EVENT } from '../mappings/index.js';

@Injectable()
export class ModerationDecidedHandler {
  private readonly logger = new Logger(ModerationDecidedHandler.name);

  constructor(
    private readonly applyModerationDecisionUseCase: ApplyModerationDecisionUseCase,
  ) {}

  async handle(payload: unknown): Promise<void> {
    if (!isModerationDecidedPayload(payload)) {
      this.logger.warn(
        'Ignoring invalid blog.comment.moderation.decided payload',
      );
      return;
    }
    if (!isUuid(payload.comment_id)) {
      this.logger.warn(
        `Ignoring decision for invalid comment id ${payload.comment_id}`,
      );
      return;
    }

    const result = await this.applyModerationDecisionUseCase.execute({
      id: payload.comment_id.toLowerCase() as CommentId,
      decision: MODERATION_DECISION_FROM_EVENT[payload.decision],
      note: payload.note,
    });
    if (result.isFailure) {
      this.logger.warn(
        `Decision for comment ${payload.comment_id} not applied: ${result.error.message}`,
      );
    }
  }
}
