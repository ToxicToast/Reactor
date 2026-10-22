import {
  type DomainContext,
  type Factory,
  Result,
} from '@toxictoast/shared-kernel';
import type { MediaAnemic } from '../anemics/index.js';
import type { MediaData } from '../data/index.js';
import { MediaDomain } from '../domains/index.js';
import { MediaStatus } from '../enums/index.js';
import type { MediaId } from '../types/index.js';
import {
  ValidateMediaAltText,
  ValidateMediaFilename,
  ValidateMediaSize,
  ValidateMediaType,
} from '../validations/index.js';

export class MediaFactory implements Factory<
  MediaAnemic,
  MediaDomain,
  MediaData
> {
  constructor(private readonly ctx: DomainContext) {}

  reconstitute(anemic: MediaAnemic): MediaDomain {
    return new MediaDomain({ ...anemic }, this.ctx);
  }

  constitute(domain: MediaDomain): MediaAnemic {
    return domain.toAnemic();
  }

  createDomain(data: MediaData): Result<MediaDomain> {
    const filename = data.filename.trim();
    const altText = data.alt_text?.trim() || null;
    const validations = [
      new ValidateMediaFilename(filename),
      new ValidateMediaType(data.mime_type),
      new ValidateMediaSize(data.size),
      new ValidateMediaAltText(altText),
    ];
    for (const validation of validations) {
      const result = validation.validate();
      if (result.isFailure) {
        return Result.fail(result.error);
      }
    }

    const id = this.ctx.id.generate<'Media'>();
    const domain = new MediaDomain(
      {
        id,
        object_key: this.buildObjectKey(id, filename),
        filename,
        mime_type: data.mime_type,
        size: data.size,
        alt_text: altText,
        status: MediaStatus.PENDING,
        created_at: this.ctx.date.now(),
        updated_at: null,
        deleted_at: null,
      },
      this.ctx,
    );
    domain.createMedia();
    return Result.ok(domain);
  }

  private buildObjectKey(id: MediaId, filename: string): string {
    const extension = filename.includes('.')
      ? filename.split('.').pop()?.toLowerCase()
      : undefined;
    return extension ? `media/${id}.${extension}` : `media/${id}`;
  }
}
