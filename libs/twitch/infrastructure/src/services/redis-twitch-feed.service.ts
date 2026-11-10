import {
  HandlerSet,
  type FeedHandler,
  type LiveChannel,
  type RecordedTwitchEvent,
  type TwitchFeed,
  type TwitchFeedSource,
  type Unsubscribe,
} from '@toxictoast/twitch-application';
import type { Redis } from 'ioredis';
import { TWITCH_FEED_TOPICS } from '../constants/index.js';
import { decodeFeedEvent, decodeLiveChannels } from '../functions/index.js';

export class RedisTwitchFeed implements TwitchFeed, TwitchFeedSource {
  private readonly events = new HandlerSet<RecordedTwitchEvent>();
  private readonly live = new HandlerSet<ReadonlyArray<LiveChannel>>();

  constructor(
    private readonly publisher: Redis,
    private readonly subscriber: Redis,
  ) {}

  async start(): Promise<void> {
    this.subscriber.on('message', this.dispatch);
    await this.subscriber.subscribe(
      TWITCH_FEED_TOPICS.EVENTS,
      TWITCH_FEED_TOPICS.LIVE,
    );
  }

  async stop(): Promise<void> {
    await this.subscriber.unsubscribe(
      TWITCH_FEED_TOPICS.EVENTS,
      TWITCH_FEED_TOPICS.LIVE,
    );
    this.subscriber.off('message', this.dispatch);
  }

  async publishEvent(event: RecordedTwitchEvent): Promise<void> {
    await this.publisher.publish(
      TWITCH_FEED_TOPICS.EVENTS,
      JSON.stringify(event),
    );
  }

  async publishLive(channels: ReadonlyArray<LiveChannel>): Promise<void> {
    await this.publisher.publish(
      TWITCH_FEED_TOPICS.LIVE,
      JSON.stringify(channels),
    );
  }

  onEvent(handler: FeedHandler<RecordedTwitchEvent>): Unsubscribe {
    return this.events.add(handler);
  }

  onLive(handler: FeedHandler<ReadonlyArray<LiveChannel>>): Unsubscribe {
    return this.live.add(handler);
  }

  private readonly dispatch = (topic: string, message: string): void => {
    if (topic === TWITCH_FEED_TOPICS.EVENTS) {
      this.events.emit(decodeFeedEvent(message));
      return;
    }
    if (topic === TWITCH_FEED_TOPICS.LIVE) {
      this.live.emit(decodeLiveChannels(message));
    }
  };
}
