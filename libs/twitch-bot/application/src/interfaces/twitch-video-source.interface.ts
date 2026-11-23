import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import type { TwitchVideo } from './twitch-video.interface.js';

export interface TwitchVideoSource {
  /** neueste VODs aller Typen, neueste zuerst */
  listRecent(
    channel: TrackedChannel,
    limit: number,
  ): Promise<Array<TwitchVideo>>;
  listAll(channel: TrackedChannel): Promise<Array<TwitchVideo>>;
}
