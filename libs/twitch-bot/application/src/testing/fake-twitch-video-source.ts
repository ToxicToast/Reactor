import type { TwitchChannelAnemic } from '@toxictoast/twitch-bot-domain';
import type { TwitchVideo, TwitchVideoSource } from '../interfaces/index.js';

export class FakeTwitchVideoSource implements TwitchVideoSource {
  /** neueste zuerst, wie bei Helix */
  videos: Array<TwitchVideo> = [];

  async listRecent(
    _channel: TwitchChannelAnemic,
    limit: number,
  ): Promise<Array<TwitchVideo>> {
    return this.videos.slice(0, limit);
  }

  async listAll(_channel: TwitchChannelAnemic): Promise<Array<TwitchVideo>> {
    return [...this.videos];
  }
}
