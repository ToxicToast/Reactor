import type { Repository } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchChannelAnemic } from '../anemics/index.js';

export interface TwitchChannelRepository extends Repository<TwitchChannelAnemic> {
  findByTwitchId(twitchId: string): Promise<Nullable<TwitchChannelAnemic>>;
  findConnected(): Promise<Array<TwitchChannelAnemic>>;
}
