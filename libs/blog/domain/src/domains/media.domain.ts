import type { Nullable } from '@toxictoast/shared-types';
import { BaseDomain, ConflictError, Result } from '@toxictoast/shared-kernel';
import type { MediaAnemic } from '../anemics/index.js';
import { MediaStatus } from '../enums/index.js';
import {
  ValidateMediaAltText,
  ValidateMediaSize,
} from '../validations/index.js';
import {
  CreateMediaEvent,
  DeleteMediaEvent,
  ReadyMediaEvent,
  RestoreMediaEvent,
  UpdateMediaEvent,
} from '../events/index.js';

export class MediaDomain extends BaseDomain<MediaAnemic> {
  get isReady(): boolean {
    return this.state.status === MediaStatus.READY;
  }

  createMedia(): void {
    this.raise(CreateMediaEvent);
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
    this.raise(ReadyMediaEvent);
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
    this.raise(UpdateMediaEvent);
    return Result.ok();
  }

  deleteMedia(): void {
    this.markDeleted(DeleteMediaEvent);
  }

  restoreMedia(): void {
    this.markRestored(RestoreMediaEvent);
  }
}
