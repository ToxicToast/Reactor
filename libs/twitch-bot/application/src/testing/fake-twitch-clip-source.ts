import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import type { TwitchClip, TwitchClipSource } from '../interfaces/index.js';

export class FakeTwitchClipSource implements TwitchClipSource {
  clips: Array<TwitchClip> = [];
  readonly requests: Array<{ channel_id: string; since: Date }> = [];

  async listClips(
    channel: TwitchChannelAnemic,
    since: Date,
  ): Promise<Array<TwitchClip>> {
    this.requests.push({ channel_id: channel.id, since });
    return [...this.clips];
  }
}
