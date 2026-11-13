import type { Repository } from '@toxictoast/shared-kernel';
import type { Optional } from '@toxictoast/shared-types';
import type { MediaAnemic } from '../anemics/index.js';
import type { MediaStatus } from '../enums/index.js';
import type { MediaId } from '../types/index.js';

export interface MediaRepository extends Repository<MediaAnemic> {
  findByIds(ids: ReadonlyArray<MediaId>): Promise<Array<MediaAnemic>>;
  findByStatus(
    status: MediaStatus,
    olderThan?: Optional<Date>,
  ): Promise<Array<MediaAnemic>>;
}
