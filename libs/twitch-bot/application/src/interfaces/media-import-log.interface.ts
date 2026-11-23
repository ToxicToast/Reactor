import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';

export interface MediaImportLog {
  isImported(channelId: TrackedChannelId): Promise<boolean>;
  markImported(channelId: TrackedChannelId, at: Date): Promise<void>;
}
