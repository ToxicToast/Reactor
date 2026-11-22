import type { FileStorage } from '@toxictoast/shared-application';
import type { MediaId } from '@toxictoast/blog-domain';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import { publicMediaKey } from '../functions/index.js';

export class PublicMediaUrls {
  constructor(private readonly storage: FileStorage) {}

  urlOf(id: Nullable<MediaId>): Optional<string> {
    if (id === null) {
      return undefined;
    }
    return this.storage.publicUrl(publicMediaKey(id));
  }
}
