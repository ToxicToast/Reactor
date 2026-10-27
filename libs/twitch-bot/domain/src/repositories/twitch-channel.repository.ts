import type { Repository } from '@toxictoast/shared-kernel';
import type { Chainable, Nullable } from '@toxictoast/shared-types';
import type { TwitchChannelAnemic } from '../anemics/index.js';

interface AdditionalMethods {
  findByTwitchId(twitchId: string): Promise<Nullable<TwitchChannelAnemic>>;
  findConnected(): Promise<Array<TwitchChannelAnemic>>;
}

export type TwitchChannelRepository = Chainable<
  Repository<TwitchChannelAnemic>,
  AdditionalMethods
>;
