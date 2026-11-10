import type { RecordedTwitchEvent } from './recorded-twitch-event.interface.js';

export interface TwitchEventLog {
  /** true, wenn das Event neu war */
  record(event: RecordedTwitchEvent): Promise<boolean>;
}
