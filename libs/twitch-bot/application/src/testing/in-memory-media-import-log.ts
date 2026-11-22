import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import type { MediaImportLog } from '../interfaces/index.js';

export class InMemoryMediaImportLog implements MediaImportLog {
  readonly items = new Map<TwitchChannelId, Date>();

  async isImported(channelId: TwitchChannelId): Promise<boolean> {
    return this.items.has(channelId);
  }

  async markImported(channelId: TwitchChannelId, at: Date): Promise<void> {
    this.items.set(channelId, at);
  }
}
