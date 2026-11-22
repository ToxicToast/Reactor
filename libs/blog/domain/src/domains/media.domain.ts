import type { Nullable } from '@toxictoast/shared-types';
import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { MediaAnemic } from '../anemics/index.js';
import { MediaStatus } from '../enums/index.js';
import {
  ValidateMediaAltText,
  ValidateMediaSize,
} from '../validations/index.js';
import { MediaEvents, type MediaEventPayload } from '../events/index.js';

export class MediaDomain extends BaseDomain<MediaAnemic, MediaEventPayload> {
  get isReady(): boolean {
    return this.state.status === MediaStatus.READY;
  }

  create(): void {
    this.raise(MediaEvents.CREATED);
  }

  markReady(actualSize: number): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Media is deleted'));
    }
    if (this.isReady) {
      return Result.fail(new ConflictError('Media is already ready'));
    }
    const size = new ValidateMediaSize(actualSize).validate();
    if (size.isFailure) {
      return Result.fail(size.error);
    }
    this.state.size = actualSize;
    this.state.status = MediaStatus.READY;
    this.touch();
    this.raise(MediaEvents.UPLOAD_CONFIRMED);
    return Result.ok();
  }

  updateAltText(altText: Nullable<string>): Result<void> {
    if (this.isDeleted) {
      return Result.fail(new ConflictError('Media is deleted'));
    }

    const trimmed = altText?.trim() || null;
    const validation = new ValidateMediaAltText(trimmed).validate();
    if (validation.isFailure) {
      return Result.fail(validation.error);
    }
    if (trimmed === this.state.alt_text) {
      return Result.ok();
    }

    this.state.alt_text = trimmed;
    this.touch();
    this.raise(MediaEvents.UPDATED);
    return Result.ok();
  }

  delete(): void {
    this.markDeleted(MediaEvents.DELETED);
  }

  restore(): void {
    this.markRestored(MediaEvents.RESTORED);
  }

  protected override toEventPayload(): MediaEventPayload {
    return {
      id: this.state.id,
      object_key: this.state.object_key,
      filename: this.state.filename,
      mime_type: this.state.mime_type,
      size: this.state.size,
      alt_text: this.state.alt_text,
      status: this.state.status,
      created_at: this.state.created_at,
      updated_at: this.state.updated_at,
      deleted_at: this.state.deleted_at,
    };
  }
}
