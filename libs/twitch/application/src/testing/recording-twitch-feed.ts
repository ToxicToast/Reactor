import { HandlerSet } from '../classes/index.js';
import type {
  LiveChannel,
  RecordedTwitchEvent,
  TwitchFeed,
  TwitchFeedSource,
} from '../interfaces/index.js';
import type { FeedHandler, Unsubscribe } from '../types/index.js';

export class RecordingTwitchFeed implements TwitchFeed, TwitchFeedSource {
  readonly events: Array<RecordedTwitchEvent> = [];
  readonly live: Array<ReadonlyArray<LiveChannel>> = [];
  private readonly eventHandlers = new HandlerSet<RecordedTwitchEvent>();
  private readonly liveHandlers = new HandlerSet<ReadonlyArray<LiveChannel>>();

  async publishEvent(event: RecordedTwitchEvent): Promise<void> {
    this.events.push(event);
    this.eventHandlers.emit(event);
  }

  async publishLive(channels: ReadonlyArray<LiveChannel>): Promise<void> {
    this.live.push(channels);
    this.liveHandlers.emit(channels);
  }

  onEvent(handler: FeedHandler<RecordedTwitchEvent>): Unsubscribe {
    return this.eventHandlers.add(handler);
  }

  onLive(handler: FeedHandler<ReadonlyArray<LiveChannel>>): Unsubscribe {
    return this.liveHandlers.add(handler);
  }
}
