import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { PublishedClipLedger } from '../interfaces/index.js';

export class InMemoryPublishedClipLedger implements PublishedClipLedger {
  readonly items = new Map<TwitchChannelId, Set<string>>();

  async markPublished(
    channelId: TwitchChannelId,
    clipIds: ReadonlyArray<string>,
  ): Promise<Array<string>> {
    const known = this.items.get(channelId) ?? new Set<string>();
    const fresh = [...new Set(clipIds)].filter((id) => !known.has(id));
    for (const id of fresh) {
      known.add(id);
    }
    this.items.set(channelId, known);
    return fresh;
  }
}
