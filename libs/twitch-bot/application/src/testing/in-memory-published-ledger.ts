import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { PublishedLedger } from '../interfaces/index.js';

export class InMemoryPublishedLedger implements PublishedLedger {
  readonly items = new Map<TrackedChannelId, Set<string>>();

  async markPublished(
    channelId: TrackedChannelId,
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
