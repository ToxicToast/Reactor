import type { MediaId } from '@toxictoast/blog-domain';
import type { Optional } from '@toxictoast/shared-types';

export interface SyncPublicMediaInput {
  /** ohne Angabe werden alle Medien abgeglichen */
  readonly media_ids?: Optional<ReadonlyArray<MediaId>>;
}

export interface SyncPublicMediaOutput {
  readonly published: number;
  readonly removed: number;
}
