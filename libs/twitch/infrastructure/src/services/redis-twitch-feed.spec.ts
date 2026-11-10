import type {
  LiveChannel,
  RecordedTwitchEvent,
} from '@toxictoast/twitch-application';
import { FakeRedisPubSub } from '../testing/index.js';
import { RedisTwitchFeed } from './redis-twitch-feed.service.js';

const EVENT: RecordedTwitchEvent = {
  event_id: 'event-1',
  topic: 'twitch.chat',
  name: 'message',
  channel_id: '123456',
  occurred_at: new Date('2026-10-28T20:00:00Z'),
  payload: { text: 'hi' },
};

const LIVE: Array<LiveChannel> = [
  {
    channel_id: '123456',
    channel_login: 'toxictoast',
    channel_name: 'ToxicToast',
    live: true,
    session_id: 'session-1',
    started_at: new Date('2026-10-28T19:00:00Z'),
    chatters: 3,
  },
];

describe('RedisTwitchFeed', () => {
  let bus: FakeRedisPubSub;
  let feed: RedisTwitchFeed;

  beforeEach(async () => {
    bus = new FakeRedisPubSub();
    feed = new RedisTwitchFeed(bus.asRedis(), bus.asRedis());
    await feed.start();
  });

  it('delivers events with their dates restored', async () => {
    const received: Array<RecordedTwitchEvent> = [];
    feed.onEvent((event) => received.push(event));

    await feed.publishEvent(EVENT);

    expect(received).toEqual([EVENT]);
    expect(received[0].occurred_at).toBeInstanceOf(Date);
  });

  it('delivers the live status', async () => {
    const received: Array<ReadonlyArray<LiveChannel>> = [];
    feed.onLive((channels) => received.push(channels));

    await feed.publishLive(LIVE);
    await feed.publishLive([{ ...LIVE[0], live: false, started_at: null }]);

    expect(received).toEqual([
      LIVE,
      [{ ...LIVE[0], live: false, started_at: null }],
    ]);
  });

  it('stops delivering to unsubscribed handlers', async () => {
    const handler = jest.fn();
    const unsubscribe = feed.onEvent(handler);

    unsubscribe();
    await feed.publishEvent(EVENT);

    expect(handler).not.toHaveBeenCalled();
  });

  it('stops listening after stop', async () => {
    const handler = jest.fn();
    feed.onEvent(handler);

    await feed.stop();
    await feed.publishEvent(EVENT);

    expect(handler).not.toHaveBeenCalled();
  });
});
