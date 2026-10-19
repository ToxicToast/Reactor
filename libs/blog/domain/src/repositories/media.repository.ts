import type {
  Chainable,
  Optional,
  Repository,
} from '@toxictoast/shared-kernel';
import type { MediaAnemic } from '../anemics/index.js';
import type { MediaStatus } from '../enums/index.js';
import type { MediaId } from '../types/index.js';

interface AdditionalMethods {
  findByIds(ids: ReadonlyArray<MediaId>): Promise<Array<MediaAnemic>>;
  findByStatus(
    status: MediaStatus,
    olderThan?: Optional<Date>,
  ): Promise<Array<MediaAnemic>>;
}

export type MediaRepository = Chainable<
  Repository<MediaAnemic>,
  AdditionalMethods
>;
