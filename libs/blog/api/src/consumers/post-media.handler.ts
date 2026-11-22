import { Injectable, Logger } from '@nestjs/common';
import { SyncPublicMediaUseCase } from '@toxictoast/blog-application';
import type { MediaId } from '@toxictoast/blog-domain';
import { isUuid, readPayload } from '@toxictoast/shared-kernel';
import { POST_IMAGE_FIELDS } from '../constants/index.js';

@Injectable()
export class PostMediaHandler {
  private readonly logger = new Logger(PostMediaHandler.name);

  constructor(
    private readonly syncPublicMediaUseCase: SyncPublicMediaUseCase,
  ) {}

  async handle(payload: unknown): Promise<void> {
    const ids = readPayload(payload, (reader) => {
      return POST_IMAGE_FIELDS.map((field) => reader.nullableString(field))
        .filter((id): id is string => id !== null && isUuid(id))
        .map((id) => id.toLowerCase() as MediaId);
    });
    if (ids.isFailure) {
      this.logger.warn(
        `Ignoring invalid blog.post payload: ${ids.error.message}`,
      );
      return;
    }
    if (ids.value.length === 0) {
      return;
    }

    const result = await this.syncPublicMediaUseCase.execute({
      media_ids: ids.value,
    });
    if (result.isFailure) {
      this.logger.warn(`Public media not synced: ${result.error.message}`);
    }
  }
}
