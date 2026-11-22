import type { Repository } from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { StreamSessionAnemic } from '../anemics/index.js';
import type { StatsRange } from '../interfaces/index.js';

export interface StreamSessionRepository extends Repository<StreamSessionAnemic> {
  findLive(channelId: string): Promise<Nullable<StreamSessionAnemic>>;
  findLatest(channelId: string): Promise<Nullable<StreamSessionAnemic>>;
  findByChannel(
    channelId: string,
    range: StatsRange,
    limit?: Optional<number>,
    offset?: Optional<number>,
  ): Promise<Array<StreamSessionAnemic>>;
}
