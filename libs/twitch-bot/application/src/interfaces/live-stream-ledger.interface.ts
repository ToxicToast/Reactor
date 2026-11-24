import type { TrackedChannelId } from '@toxictoast/twitch-bot-domain';
import type { LiveStreamEntry } from './live-stream-entry.interface.js';

/** merkt sich, welcher Stream bei einem Freund zuletzt lief */
export interface LiveStreamLedger {
  list(): Promise<Array<LiveStreamEntry>>;
  start(entry: LiveStreamEntry): Promise<void>;
  end(channelId: TrackedChannelId): Promise<void>;
}
