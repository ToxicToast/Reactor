import {
  TWITCH_TEST_CHANNEL,
  TWITCH_TEST_NOW,
  TwitchTestHarness,
} from '../testing/index.js';
import { ListStatsChannelsUseCase } from './list-stats-channels.usecase.js';

describe('Follower totals', () => {
  let harness: TwitchTestHarness;
  let sequence = 0;

  const count = (total: number, observedAt = TWITCH_TEST_NOW) => {
    sequence++;
    return harness.record.execute({
      event: {
        event_id: `count-${sequence}`,
        topic: 'twitch.community',
        name: 'follower_count',
        channel_id: TWITCH_TEST_CHANNEL.channel_id,
        occurred_at: observedAt,
        payload: {},
      },
      observation: null,
      followers: {
        channel: TWITCH_TEST_CHANNEL,
        total,
        observed_at: observedAt,
      },
    });
  };

  beforeEach(() => {
    harness = new TwitchTestHarness();
  });

  it('lists a channel with its latest follower total, even without streams', async () => {
    await count(100);
    await count(104);

    const result = await new ListStatsChannelsUseCase(
      harness.directory,
      harness.sessions,
      harness.channelStats,
    ).execute();

    expect(result.value).toEqual([
      expect.objectContaining({
        channel_id: TWITCH_TEST_CHANNEL.channel_id,
        live: false,
        followers: 104,
      }),
    ]);
  });
});
