import { DomainPersistence } from '@toxictoast/shared-application';
import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import {
  TwitchFriendFactory,
  type TwitchFriendId,
} from '@toxictoast/twitch-bot-domain';
import {
  createTestContext,
  FakeTwitchUserLookup,
  InMemoryTwitchChannelRepository,
  InMemoryTwitchFriendRepository,
  twitchChannelAnemic,
} from '../testing/index.js';
import { AddFriendUseCase } from './add-friend.usecase.js';
import { ListFriendsUseCase } from './list-friends.usecase.js';
import { RemoveFriendUseCase } from './remove-friend.usecase.js';

const VERO = {
  twitch_id: '987654',
  login: 'maybeitsvero',
  display_name: 'Maybeitsvero',
};

describe('Friends', () => {
  let friends: InMemoryTwitchFriendRepository;
  let channels: InMemoryTwitchChannelRepository;
  let users: FakeTwitchUserLookup;
  let add: AddFriendUseCase;
  let remove: RemoveFriendUseCase;
  let list: ListFriendsUseCase;

  beforeEach(() => {
    const ctx = createTestContext();
    const factory = new TwitchFriendFactory(ctx);
    const persistence = new DomainPersistence(
      new InMemoryOutbox(),
      new ImmediateUnitOfWork(),
    );
    friends = new InMemoryTwitchFriendRepository();
    channels = new InMemoryTwitchChannelRepository();
    users = new FakeTwitchUserLookup();
    users.users = [VERO];
    add = new AddFriendUseCase(factory, friends, channels, persistence, users);
    remove = new RemoveFriendUseCase(factory, friends, persistence);
    list = new ListFriendsUseCase(friends);
  });

  it('adds a friend by login', async () => {
    const result = await add.execute({ login: ' MaybeItsVero ' });

    expect(result.value).toMatchObject(VERO);
    expect((await list.execute()).value).toHaveLength(1);
  });

  it('rejects unknown logins', async () => {
    const result = await add.execute({ login: 'nobody' });

    expect(result.error?.message).toContain('not found');
  });

  it('rejects channels that are connected to the bot', async () => {
    await channels.save(
      twitchChannelAnemic('channel-1', { twitch_id: VERO.twitch_id }),
    );

    const result = await add.execute({ login: VERO.login });

    expect(result.isFailure).toBe(true);
  });

  it('keeps the id when a removed friend is added again', async () => {
    const first = (await add.execute({ login: VERO.login })).value;
    await remove.execute({ id: first.id as TwitchFriendId });

    const again = await add.execute({ login: VERO.login });

    expect(again.value.id).toBe(first.id);
    expect(again.value.deleted_at).toBeNull();
  });
});
