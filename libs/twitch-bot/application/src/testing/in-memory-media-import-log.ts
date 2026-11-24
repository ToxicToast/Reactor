import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { MediaImportLog } from '../interfaces/index.js';

export class InMemoryMediaImportLog implements MediaImportLog {
  readonly items = new Map<TrackedChannelId, Date>();

  async isImported(channelId: TrackedChannelId): Promise<boolean> {
    return this.items.has(channelId);
  }

  async markImported(channelId: TrackedChannelId, at: Date): Promise<void> {
    this.items.set(channelId, at);
  }
}
