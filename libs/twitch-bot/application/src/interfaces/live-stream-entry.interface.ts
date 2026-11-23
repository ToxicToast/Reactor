import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';

export interface LiveStreamEntry {
  readonly channel_id: TrackedChannelId;
  readonly stream_id: string;
  readonly started_at: Date;
}
