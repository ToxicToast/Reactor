import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import type { Follower, TwitchChannelId } from '@toxictoast/twitch-bot-domain';
import {
  createTestContext,
  FakeTwitchFollowerSource,
  InMemoryFollowerRepository,
  InMemoryTwitchChannelRepository,
  twitchChannelAnemic,
} from '../testing/index.js';
import { SyncFollowersUseCase } from './sync-followers.usecase.js';

const CHANNEL_ID = 'channel-1' as TwitchChannelId;

const follower = (id: string, followedAt: string): Follower => ({
  user_id: id,
  user_login: `user${id}`,
  user_name: `User${id}`,
  followed_at: new Date(followedAt),
});

const EARLY = follower('1', '2025-03-01T10:00:00Z');
const LATE = follower('2', '2026-11-01T10:00:00Z');

describe('SyncFollowersUseCase', () => {
  let channels: InMemoryTwitchChannelRepository;
  let followers: InMemoryFollowerRepository;
  let source: FakeTwitchFollowerSource;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: SyncFollowersUseCase;

  beforeEach(async () => {
    channels = new InMemoryTwitchChannelRepository();
    followers = new InMemoryFollowerRepository();
    source = new FakeTwitchFollowerSource();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new SyncFollowersUseCase(
      channels,
      followers,
      source,
      outbox,
      uow,
      createTestContext(),
    );
    await channels.save(twitchChannelAnemic(CHANNEL_ID));
  });

  it('imports every follower in follow order on the first sync', async () => {
    source.followers.set(CHANNEL_ID, [LATE, EARLY, EARLY]);

    const result = await useCase.execute();

    expect(result.value).toEqual({ followed: 2, unfollowed: 0 });
    expect(
      outbox.events.map((e) => `${e.event_namespace}:${e.event_name}`),
    ).toEqual([
      'twitch.community:follow_found',
      'twitch.community:follow_found',
    ]);
    expect(outbox.events[0]).toMatchObject({
      aggregate_id: CHANNEL_ID,
      payload: {
        channel_id: '123456',
        channel_login: 'toxictoast',
        channel_name: 'ToxicToast',
        user_id: '1',
        user_login: 'user1',
        user_name: 'User1',
        followed_at: '2025-03-01T10:00:00.000Z',
      },
    });
    expect(await followers.findByChannel(CHANNEL_ID)).toEqual([LATE, EARLY]);
  });

  it('publishes unfollows with the original follow date', async () => {
    await followers.replace(CHANNEL_ID, [EARLY, LATE]);
    source.followers.set(CHANNEL_ID, [LATE]);

    const result = await useCase.execute();

    expect(result.value).toEqual({ followed: 0, unfollowed: 1 });
    expect(outbox.events).toHaveLength(1);
    expect(outbox.events[0]).toMatchObject({
      event_namespace: 'twitch.community',
      event_name: 'unfollow',
      payload: { user_id: '1', followed_at: '2025-03-01T10:00:00.000Z' },
    });
    expect(await followers.findByChannel(CHANNEL_ID)).toEqual([LATE]);
  });

  it('writes nothing when nothing changed', async () => {
    await followers.replace(CHANNEL_ID, [EARLY]);
    source.followers.set(CHANNEL_ID, [EARLY]);

    const result = await useCase.execute();

    expect(result.value).toEqual({ followed: 0, unfollowed: 0 });
    expect(outbox.events).toHaveLength(0);
    expect(uow.runs).toBe(0);
  });

  it('skips disconnected channels', async () => {
    await channels.save(twitchChannelAnemic(CHANNEL_ID, { connected: false }));
    source.followers.set(CHANNEL_ID, [EARLY]);

    const result = await useCase.execute();

    expect(result.value).toEqual({ followed: 0, unfollowed: 0 });
    expect(outbox.events).toHaveLength(0);
  });
});
