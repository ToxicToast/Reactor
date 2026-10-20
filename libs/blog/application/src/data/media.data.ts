import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  MediaAnemic,
  MediaId,
  MediaStatus,
} from '@toxictoast/blog-domain';

export interface RequestMediaUploadOutput {
  readonly media: MediaAnemic;
  readonly upload_url: string;
}

export interface MediaIdInput {
  readonly id: MediaId;
  readonly withDeleted?: Optional<boolean>;
}

export interface UpdateMediaAltTextInput {
  readonly id: MediaId;
  readonly alt_text: Nullable<string>;
}

export interface MediaUrlOutput {
  readonly url: string;
  readonly expires_in: number;
}

export interface ListMediaInput {
  readonly status?: Optional<MediaStatus>;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
  readonly withDeleted?: Optional<boolean>;
}

export interface CleanupPendingMediaInput {
  readonly olderThan: Date;
}

export interface CleanupPendingMediaOutput {
  readonly removed: number;
}
