import {
  ObservationKinds,
  type TwitchObservation,
} from '@toxictoast/twitch-domain';
import { webhookAnemic } from '@toxictoast/shared-webhooks-application';
import {
  observation,
  TWITCH_TEST_CHANNEL,
  TwitchTestHarness,
  viewer,
} from '../testing/index.js';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;
const DAY = '2026-10-28';

const at = (time: string): Date => new Date(`2026-10-28T${time}Z`);

describe('RecordTwitchEventUseCase', () => {
  let harness: TwitchTestHarness;

  const record = (
    input: TwitchObservation,
    topic = 'twitch.chat',
    name = 'message',
  ) => {
    return harness.observe(input, topic, name);
  };

  const goOnline = (time = '20:00:00') => {
    return record(
      observation({
        kind: ObservationKinds.STREAM_ONLINE,
        stream_id: 'stream-1',
        occurred_at: at(time),
      }),
      'twitch.stream',
      'online',
    );
  };

  const goOffline = (time: string) => {
    return record(
      observation({
        kind: ObservationKinds.STREAM_OFFLINE,
        occurred_at: at(time),
      }),
      'twitch.stream',
      'offline',
    );
  };

  beforeEach(() => {
    harness = new TwitchTestHarness();
  });

  it('records an event only once', async () => {
    const message = observation({ user: viewer('1') });

    const first = await record(message);
    const second = await record(message);

    expect(first.value.recorded).toBe(true);
    expect(second.value.recorded).toBe(false);
    expect(harness.channelStats.counters(CHANNEL_ID, DAY).messages).toBe(1);
    expect(harness.feed.events).toHaveLength(1);
  });

  it('counts messages for channel, viewer and unique chatters', async () => {
    await record(observation({ user: viewer('1') }));
    await record(observation({ user: viewer('1') }));
    await record(observation({ user: viewer('2') }));

    expect(harness.channelStats.counters(CHANNEL_ID, DAY)).toMatchObject({
      messages: 3,
      unique_chatters: 2,
    });
    expect(harness.viewerStats.total(CHANNEL_ID, '1').messages).toBe(2);
  });

  it('starts a session and counts into it while live', async () => {
    await goOnline();
    await record(
      observation({ user: viewer('1'), occurred_at: at('20:05:00') }),
    );
    await record(
      observation({
        kind: ObservationKinds.CHEER,
        user: viewer('1'),
        amount: 100,
        occurred_at: at('20:06:00'),
      }),
    );

    const live = await harness.sessions.findLive(CHANNEL_ID);
    expect(live).toMatchObject({
      stream_id: 'stream-1',
      messages: 1,
      bits: 100,
      unique_chatters: 1,
    });
    expect(harness.outbox.events.map((event) => event.event_name)).toEqual([
      'started',
    ]);
  });

  it('ignores a second online for the same stream', async () => {
    await goOnline();
    await record(
      observation({
        kind: ObservationKinds.STREAM_ONLINE,
        stream_id: 'stream-1',
        occurred_at: at('20:01:00'),
      }),
      'twitch.stream',
      'online',
    );

    expect(harness.sessions.items.size).toBe(1);
  });

  it('credits watch time only while the stream is live', async () => {
    await record(
      observation({
        kind: ObservationKinds.JOIN,
        user: viewer('1'),
        occurred_at: at('19:00:00'),
      }),
      'twitch.presence',
      'joined',
    );
    await goOnline('20:00:00');
    await record(
      observation({
        kind: ObservationKinds.JOIN,
        user: viewer('2'),
        occurred_at: at('20:30:00'),
      }),
      'twitch.presence',
      'joined',
    );
    await record(
      observation({
        kind: ObservationKinds.LEAVE,
        user: viewer('2'),
        occurred_at: at('21:00:00'),
      }),
      'twitch.presence',
      'left',
    );
    await goOffline('22:00:00');

    expect(harness.viewerStats.total(CHANNEL_ID, '1').watch_seconds).toBe(7200);
    expect(harness.viewerStats.total(CHANNEL_ID, '2').watch_seconds).toBe(1800);
    expect(harness.channelStats.counters(CHANNEL_ID, DAY).stream_seconds).toBe(
      7200,
    );
  });

  it('keeps the chatter peak of the session and the day', async () => {
    await goOnline();
    await record(
      observation({ kind: ObservationKinds.JOIN, user: viewer('1') }),
      'twitch.presence',
      'joined',
    );
    await record(
      observation({ kind: ObservationKinds.JOIN, user: viewer('2') }),
      'twitch.presence',
      'joined',
    );
    await record(
      observation({ kind: ObservationKinds.LEAVE, user: viewer('1') }),
      'twitch.presence',
      'left',
    );

    expect((await harness.sessions.findLive(CHANNEL_ID))?.peak_chatters).toBe(
      2,
    );
    expect(
      harness.channelStats.days.get(`${CHANNEL_ID}|${DAY}`)?.peak_chatters,
    ).toBe(2);
  });

  it('ends the session with duration and an ended event', async () => {
    await goOnline('20:00:00');
    await goOffline('21:30:00');

    expect(await harness.sessions.findLive(CHANNEL_ID)).toBeNull();
    expect(await harness.sessions.findLatest(CHANNEL_ID)).toMatchObject({
      duration_seconds: 5400,
    });
    expect(harness.outbox.events.map((event) => event.event_name)).toEqual([
      'started',
      'ended',
    ]);
  });

  it('counts anonymous gifts only for the channel', async () => {
    await record(
      observation({ kind: ObservationKinds.GIFT, amount: 5 }),
      'twitch.community',
      'gift',
    );

    expect(harness.channelStats.counters(CHANNEL_ID, DAY).gifted_subs).toBe(5);
    expect(harness.viewerStats.days.size).toBe(0);
  });

  it('counts redemptions per reward', async () => {
    const reward = { reward_id: 'reward-1', title: 'Hydrate', cost: 500 };
    await record(
      observation({
        kind: ObservationKinds.REDEMPTION,
        user: viewer('1'),
        reward,
      }),
      'twitch.redemption',
      'redeemed',
    );
    await record(
      observation({
        kind: ObservationKinds.REDEMPTION,
        user: viewer('2'),
        reward,
      }),
      'twitch.redemption',
      'redeemed',
    );

    expect(
      await harness.rewards.list(CHANNEL_ID, { from: null, to: null }),
    ).toEqual([{ ...reward, redemptions: 2, points_spent: 1000 }]);
  });

  it('enqueues webhooks for matching events', async () => {
    await harness.webhooks.save(
      webhookAnemic('webhook-1', { events: ['twitch.stream.*'] }),
    );

    await goOnline();
    await record(observation({ user: viewer('1') }));

    expect(
      harness.deliveries.items.map((delivery) => delivery.event_key),
    ).toEqual(['twitch.stream.online']);
  });

  it('publishes the live status after live relevant events', async () => {
    await record(observation({ user: viewer('1') }));
    await goOnline();

    expect(harness.feed.live).toHaveLength(1);
    expect(harness.feed.live[0]).toEqual([
      expect.objectContaining({ channel_login: 'toxictoast', live: true }),
    ]);
  });

  it('records events without observation, for example own session events', async () => {
    const result = await harness.record.execute({
      event: {
        event_id: 'session-event-1',
        topic: 'twitch.session',
        name: 'started',
        channel_id: CHANNEL_ID,
        occurred_at: at('20:00:00'),
        payload: {},
      },
      observation: null,
    });

    expect(result.value.recorded).toBe(true);
    expect(harness.feed.events.map((event) => event.topic)).toEqual([
      'twitch.session',
    ]);
  });
});
