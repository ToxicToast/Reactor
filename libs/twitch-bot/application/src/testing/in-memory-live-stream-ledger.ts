import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { LiveStreamEntry, LiveStreamLedger } from '../interfaces/index.js';

export class InMemoryLiveStreamLedger implements LiveStreamLedger {
  readonly items = new Map<TrackedChannelId, LiveStreamEntry>();

  async list(): Promise<Array<LiveStreamEntry>> {
    return [...this.items.values()];
  }

  async start(entry: LiveStreamEntry): Promise<void> {
    this.items.set(entry.channel_id, entry);
  }

  async end(channelId: TrackedChannelId): Promise<void> {
    this.items.delete(channelId);
  }
}
