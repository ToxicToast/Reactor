import type {
  TwitchLiveStream,
  TwitchStreamSource,
} from '@toxictoast/twitch-bot-application';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import { HELIX_LIMITS } from '../constants/index.js';
import { chunksOf, streamFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleStreamSource implements TwitchStreamSource {
  constructor(private readonly connection: TwitchConnection) {}

  async listLive(
    channels: ReadonlyArray<TrackedChannel>,
  ): Promise<Array<TwitchLiveStream>> {
    const api = await this.connection.appApi();
    const ids = channels.map((channel) => channel.twitch_id);
    const streams: Array<TwitchLiveStream> = [];
    for (const batch of chunksOf(ids, HELIX_LIMITS.IDS_PER_REQUEST)) {
      const { data } = await api.streams.getStreams({
        userId: batch,
        limit: HELIX_LIMITS.IDS_PER_REQUEST,
      });
      streams.push(...data.map(streamFromHelix));
    }
    return streams;
  }
}
