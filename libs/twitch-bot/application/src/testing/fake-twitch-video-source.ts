import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import type { TwitchVideo, TwitchVideoSource } from '../interfaces/index.js';

export class FakeTwitchVideoSource implements TwitchVideoSource {
  /** neueste zuerst, wie bei Helix */
  videos: Array<TwitchVideo> = [];

  async listRecent(
    _channel: TrackedChannel,
    limit: number,
  ): Promise<Array<TwitchVideo>> {
    return this.videos.slice(0, limit);
  }

  async listAll(_channel: TrackedChannel): Promise<Array<TwitchVideo>> {
    return [...this.videos];
  }
}
