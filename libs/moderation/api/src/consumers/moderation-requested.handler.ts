import { Injectable, Logger } from '@nestjs/common';
import { ModerateContentUseCase } from '@toxictoast/moderation-application';
import { isModerationRequestedPayload } from '../functions/index.js';

@Injectable()
export class ModerationRequestedHandler {
  private readonly logger = new Logger(ModerationRequestedHandler.name);

  constructor(
    private readonly moderateContentUseCase: ModerateContentUseCase,
  ) {}

  async handle(payload: unknown): Promise<void> {
    if (!isModerationRequestedPayload(payload)) {
      this.logger.warn(
        'Ignoring invalid blog.comment.moderation.requested payload',
      );
      return;
    }
    if (payload.deleted_at !== null) {
      this.logger.log(`Skipping deleted comment ${payload.id}`);
      return;
    }

    const result = await this.moderateContentUseCase.execute({
      content_id: payload.id,
      content: payload.content,
    });
    this.logger.log(
      `Comment ${payload.id}: ${result.value.decision} (${result.value.confidence})`,
    );
  }
}
