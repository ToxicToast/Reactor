import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import type {
  TwitchLiveStream,
  TwitchStreamSource,
} from '../interfaces/index.js';

export class FakeTwitchStreamSource implements TwitchStreamSource {
  streams: Array<TwitchLiveStream> = [];

  async listLive(
    channels: ReadonlyArray<TrackedChannel>,
  ): Promise<Array<TwitchLiveStream>> {
    const ids = new Set(channels.map((channel) => channel.twitch_id));
    return this.streams.filter((stream) => ids.has(stream.twitch_id));
  }
}
