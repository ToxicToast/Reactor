import type { FeedHandler, Unsubscribe } from '../types/index.js';
import type { LiveChannel } from './live-channel.interface.js';
import type { RecordedTwitchEvent } from './recorded-twitch-event.interface.js';

export interface TwitchFeedSource {
  onEvent(handler: FeedHandler<RecordedTwitchEvent>): Unsubscribe;
  onLive(handler: FeedHandler<ReadonlyArray<LiveChannel>>): Unsubscribe;
}
