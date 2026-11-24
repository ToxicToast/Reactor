import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import type { TwitchLiveStream } from './twitch-live-stream.interface.js';

export interface TwitchStreamSource {
  /** nur die Channels, die gerade live sind */
  listLive(
    channels: ReadonlyArray<TrackedChannel>,
  ): Promise<Array<TwitchLiveStream>>;
}
