import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import type { TwitchVideo } from './twitch-video.interface.js';

export interface TwitchVideoSource {
  /** neueste VODs aller Typen, neueste zuerst */
  listRecent(
    channel: TwitchChannelAnemic,
    limit: number,
  ): Promise<Array<TwitchVideo>>;
  listAll(channel: TwitchChannelAnemic): Promise<Array<TwitchVideo>>;
}
