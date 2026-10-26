import type { Chatter } from '../interfaces/index.js';
import type { TwitchChannelId } from '../types/index.js';

export interface ChatterRepository {
  findByChannel(channelId: TwitchChannelId): Promise<Array<Chatter>>;
  replace(
    channelId: TwitchChannelId,
    chatters: ReadonlyArray<Chatter>,
  ): Promise<void>;
}
