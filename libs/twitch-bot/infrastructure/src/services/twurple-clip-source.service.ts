import type { Optional } from '@toxictoast/shared-types';
import type {
  TwitchClip,
  TwitchClipSource,
} from '@toxictoast/twitch-bot-application';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import { clipFromHelix } from '../functions/index.js';
import type { TwitchConnection } from './twitch-connection.service.js';

export class TwurpleClipSource implements TwitchClipSource {
  constructor(private readonly connection: TwitchConnection) {}

  async listClips(
    channel: TrackedChannel,
    since: Date,
    until?: Optional<Date>,
  ): Promise<Array<TwitchClip>> {
    const api = await this.connection.appApi();
    const clips = await api.clips
      .getClipsForBroadcasterPaginated(channel.twitch_id, {
        startDate: since.toISOString(),
        endDate: until?.toISOString(),
      })
      .getAll();
    return clips.map(clipFromHelix);
  }
}
