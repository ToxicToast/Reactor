import { Injectable, Logger } from '@nestjs/common';
import { ModerateContentUseCase } from '@toxictoast/moderation-application';
import { readPayload } from '@toxictoast/shared-kernel';

@Injectable()
export class ModerationRequestedHandler {
  private readonly logger = new Logger(ModerationRequestedHandler.name);

  constructor(
    private readonly moderateContentUseCase: ModerateContentUseCase,
  ) {}

  async handle(payload: unknown): Promise<void> {
    const request = readPayload(payload, (reader) => {
      return {
        id: reader.uuid('id'),
        content: reader.string('content'),
        deleted_at: reader.nullableString('deleted_at'),
      };
    });
    if (request.isFailure) {
      this.logger.warn(
        `Ignoring invalid blog.comment.moderation.requested payload: ${request.error.message}`,
      );
      return;
    }

    const { id, content, deleted_at } = request.value;
    if (deleted_at !== null) {
      this.logger.log(`Skipping deleted comment ${id}`);
      return;
    }

    const result = await this.moderateContentUseCase.execute({
      content_id: id,
      content,
    });
    this.logger.log(
      `Comment ${id}: ${result.value.decision} (${result.value.confidence})`,
    );
  }
}
