import type { TwitchChannelId } from '@toxictoast/twitch-bot-domain';

export interface MediaImportLog {
  isImported(channelId: TwitchChannelId): Promise<boolean>;
  markImported(channelId: TwitchChannelId, at: Date): Promise<void>;
}
