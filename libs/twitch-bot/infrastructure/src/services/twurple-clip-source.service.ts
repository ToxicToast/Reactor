import type {
  TwitchClip,
  TwitchClipSource,
} from '@toxictoast/twitch-bot-application';
import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import { clipFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleClipSource implements TwitchClipSource {
  constructor(private readonly connection: TwitchConnection) {}

  async listClips(
    channel: TwitchChannelAnemic,
    since: Date,
  ): Promise<Array<TwitchClip>> {
    const api = await this.connection.use(channel);
    const clips = await api.clips
      .getClipsForBroadcasterPaginated(channel.twitch_id, {
        startDate: since.toISOString(),
      })
      .getAll();
    return clips.map(clipFromHelix);
  }
}
