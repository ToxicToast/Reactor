import type { Optional } from '@toxictoast/shared-types';
import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import type { TwitchClip, TwitchClipSource } from '../interfaces/index.js';

export class FakeTwitchClipSource implements TwitchClipSource {
  clips: Array<TwitchClip> = [];
  readonly requests: Array<{
    channel_id: string;
    since: Date;
    until?: Optional<Date>;
  }> = [];

  async listClips(
    channel: TwitchChannelAnemic,
    since: Date,
    until?: Optional<Date>,
  ): Promise<Array<TwitchClip>> {
    this.requests.push({ channel_id: channel.id, since, until });
    return this.clips.filter((clip) => {
      return (
        clip.created_at >= since &&
        (until === undefined || clip.created_at < until)
      );
    });
  }
}
