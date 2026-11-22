import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { PublishedLedger } from '../interfaces/index.js';

export class InMemoryPublishedLedger implements PublishedLedger {
  readonly items = new Map<TwitchChannelId, Set<string>>();

  async markPublished(
    channelId: TwitchChannelId,
    ids: ReadonlyArray<string>,
  ): Promise<Array<string>> {
    const known = this.items.get(channelId) ?? new Set<string>();
    const fresh = [...new Set(ids)].filter((id) => !known.has(id));
    for (const id of fresh) {
      known.add(id);
    }
    this.items.set(channelId, known);
    return fresh;
  }
}
