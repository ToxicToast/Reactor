import type { Optional } from '@toxictoast/shared-types';
import type { Clip, ClipFilter } from '../interfaces/index.js';

export interface ClipRepository {
  /** legt den Clip an oder überschreibt ihn */
  save(clip: Clip): Promise<void>;
  list(
    filter: ClipFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Clip>>;
}
