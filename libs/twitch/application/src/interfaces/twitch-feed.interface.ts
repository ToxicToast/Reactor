import type { LiveChannel } from './live-channel.interface.js';
import type { RecordedTwitchEvent } from './recorded-twitch-event.interface.js';

export interface TwitchFeed {
  publishEvent(event: RecordedTwitchEvent): Promise<void>;
  publishLive(channels: ReadonlyArray<LiveChannel>): Promise<void>;
}
