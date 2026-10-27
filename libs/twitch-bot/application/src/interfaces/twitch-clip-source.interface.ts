import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import type { TwitchClip } from './twitch-clip.interface.js';

export interface TwitchClipSource {
  listClips(
    channel: TwitchChannelAnemic,
    since: Date,
  ): Promise<Array<TwitchClip>>;
}
