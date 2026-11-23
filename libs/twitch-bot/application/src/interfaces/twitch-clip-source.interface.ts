import type { Optional } from '@toxictoast/shared-types';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import type { TwitchClip } from './twitch-clip.interface.js';

export interface TwitchClipSource {
  listClips(
    channel: TrackedChannel,
    since: Date,
    until?: Optional<Date>,
  ): Promise<Array<TwitchClip>>;
}
