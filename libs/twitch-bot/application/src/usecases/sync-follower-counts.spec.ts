import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import { TrackedChannels } from '../services/index.js';
import {
  createTestContext,
  FakeTwitchFollowerSource,
  InMemoryTwitchChannelRepository,
  InMemoryTwitchFriendRepository,
  twitchChannelAnemic,
  twitchFriendAnemic,
} from '../testing/index.js';
import { SyncFollowerCountsUseCase } from './sync-follower-counts.usecase.js';

describe('SyncFollowerCountsUseCase', () => {
  let channels: InMemoryTwitchChannelRepository;
  let friends: InMemoryTwitchFriendRepository;
  let source: FakeTwitchFollowerSource;
  let outbox: InMemoryOutbox;
  let useCase: SyncFollowerCountsUseCase;

  beforeEach(() => {
    channels = new InMemoryTwitchChannelRepository();
    friends = new InMemoryTwitchFriendRepository();
    source = new FakeTwitchFollowerSource();
    outbox = new InMemoryOutbox();
    useCase = new SyncFollowerCountsUseCase(
      channels,
      new TrackedChannels(channels, friends),
      source,
      outbox,
      new ImmediateUnitOfWork(),
      createTestContext(),
    );
  });

  it('counts the followers of own channels and friends', async () => {
    await channels.save(
      twitchChannelAnemic('channel-1', { twitch_id: '123456' }),
    );
    await friends.save(twitchFriendAnemic('friend-1', { twitch_id: '987654' }));
    source.totals.set('123456', 120);
    source.totals.set('987654', 4500);

    const result = await useCase.execute();

    expect(result.value).toEqual({ counted: 2 });
    expect(
      outbox.events.map((event) => {
        return { name: event.event_name, payload: event.payload };
      }),
    ).toEqual([
      {
        name: 'follower_count',
        payload: expect.objectContaining({ channel_id: '123456', total: 120 }),
      },
      {
        name: 'follower_count',
        payload: expect.objectContaining({ channel_id: '987654', total: 4500 }),
      },
    ]);
  });

  it('counts nothing without a connected channel', async () => {
    await friends.save(twitchFriendAnemic('friend-1'));

    const result = await useCase.execute();

    expect(result.value).toEqual({ counted: 0 });
    expect(outbox.events).toHaveLength(0);
  });
});
