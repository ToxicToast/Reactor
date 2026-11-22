import {
  FollowStates,
  ObservationKinds,
  type ObservationKindValue,
} from '@toxictoast/twitch-domain';
import {
  observation,
  TWITCH_TEST_CHANNEL,
  TwitchTestHarness,
  viewer,
} from '../testing/index.js';
import { ListFollowsUseCase } from './list-follows.usecase.js';

const CHANNEL_ID = TWITCH_TEST_CHANNEL.channel_id;
const FIRST_FOLLOW = new Date('2025-03-01T10:00:00Z');
const SYNC = new Date('2026-10-28T20:30:00Z');
const LATER = new Date('2026-10-29T12:00:00Z');

describe('Follows', () => {
  let harness: TwitchTestHarness;
  let list: ListFollowsUseCase;

  const send = (
    kind: ObservationKindValue,
    name: string,
    occurredAt: Date,
    followedAt: Date = FIRST_FOLLOW,
  ) => {
    return harness.observe(
      observation({
        kind,
        user: viewer('1'),
        occurred_at: occurredAt,
        followed_at: followedAt,
      }),
      'twitch.community',
      name,
    );
  };

  beforeEach(() => {
    harness = new TwitchTestHarness();
    list = new ListFollowsUseCase(harness.follows);
  });

  it('stores a found follow with its real follow date', async () => {
    await send(ObservationKinds.FOLLOW_FOUND, 'follow_found', SYNC);

    expect(harness.follows.items).toEqual([
      {
        channel_id: CHANNEL_ID,
        ...viewer('1'),
        followed_at: FIRST_FOLLOW,
        unfollowed_at: null,
      },
    ]);
  });

  it('ignores a found follow while the follow is still open', async () => {
    await send(ObservationKinds.FOLLOW, 'follow', SYNC, SYNC);
    await send(ObservationKinds.FOLLOW_FOUND, 'follow_found', LATER, SYNC);

    expect(harness.follows.items).toHaveLength(1);
  });

  it('closes the open follow at the time of the sync', async () => {
    await send(ObservationKinds.FOLLOW_FOUND, 'follow_found', SYNC);
    await send(ObservationKinds.UNFOLLOW, 'unfollow', LATER);

    expect(harness.follows.items[0].unfollowed_at).toEqual(LATER);
  });

  it('starts a new entry when someone follows again', async () => {
    await send(ObservationKinds.FOLLOW_FOUND, 'follow_found', SYNC);
    await send(ObservationKinds.UNFOLLOW, 'unfollow', SYNC);
    await send(ObservationKinds.FOLLOW, 'follow', LATER, LATER);

    const active = await list.execute({
      channel_id: CHANNEL_ID,
      state: FollowStates.ACTIVE,
    });
    const ended = await list.execute({
      channel_id: CHANNEL_ID,
      state: FollowStates.ENDED,
    });
    const all = await list.execute({ channel_id: CHANNEL_ID });

    expect(active.value?.map((item) => item.followed_at)).toEqual([LATER]);
    expect(ended.value?.map((item) => item.followed_at)).toEqual([
      FIRST_FOLLOW,
    ]);
    expect(all.value).toHaveLength(2);
  });

  it('ignores an unfollow without an open follow', async () => {
    const result = await send(ObservationKinds.UNFOLLOW, 'unfollow', SYNC);

    expect(result.isSuccess).toBe(true);
    expect(harness.follows.items).toEqual([]);
  });
});
