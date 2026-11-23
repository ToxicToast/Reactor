import { ObservationKinds } from '@toxictoast/twitch-domain';
import {
  observation,
  TWITCH_TEST_CHANNEL,
  TWITCH_TEST_NOW,
  TwitchTestHarness,
} from '../testing/index.js';

const STATUS = {
  title: 'Hordentlich verpeilt',
  game_id: '18122',
  game_name: 'World of Warcraft',
  viewer_count: 7,
};

describe('Stream status', () => {
  let harness: TwitchTestHarness;
  let sequence = 0;

  const status = (streamId: string, viewers: number) => {
    sequence++;
    return harness.record.execute({
      event: {
        event_id: `status-${sequence}`,
        topic: 'twitch.stream',
        name: 'status',
        channel_id: TWITCH_TEST_CHANNEL.channel_id,
        occurred_at: TWITCH_TEST_NOW,
        payload: {},
      },
      observation: null,
      status: {
        channel: TWITCH_TEST_CHANNEL,
        stream_id: streamId,
        status: { ...STATUS, viewer_count: viewers },
      },
    });
  };

  beforeEach(async () => {
    harness = new TwitchTestHarness();
    await harness.observe(
      observation({
        kind: ObservationKinds.STREAM_ONLINE,
        stream_id: 'stream-1',
      }),
      'twitch.stream',
      'online',
    );
  });

  it('stores title, game and viewers on the live session', async () => {
    await status('stream-1', 10);
    await status('stream-1', 4);

    const [session] = [...harness.sessions.items.values()];
    expect(session).toMatchObject({
      title: STATUS.title,
      game_name: STATUS.game_name,
      viewer_count: 4,
      peak_viewers: 10,
      viewer_samples: 2,
      viewer_sum: 14,
    });
  });

  it('ignores the status of another stream', async () => {
    await status('stream-old', 10);

    const [session] = [...harness.sessions.items.values()];
    expect(session.viewer_samples).toBe(0);
  });

  it('shows title and viewers in the live status', async () => {
    await status('stream-1', 9);

    const [channel] = await harness.liveStatus.read();
    expect(channel).toMatchObject({
      live: true,
      title: STATUS.title,
      viewer_count: 9,
    });
  });
});
