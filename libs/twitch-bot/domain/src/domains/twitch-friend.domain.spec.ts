import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';
import type { TwitchFriendData } from '../data/index.js';
import { TwitchFriendFactory } from '../factories/index.js';

const ctx = createFixedTestContext(
  'friend-1',
  () => new Date('2026-11-23T19:00:00Z'),
);

const FRIEND: TwitchFriendData = {
  twitch_id: '987654',
  login: ' Maybeitsvero ',
  display_name: 'Maybeitsvero',
};

describe('TwitchFriendDomain', () => {
  const factory = new TwitchFriendFactory(ctx);

  it('normalizes the login and announces the friend', () => {
    const friend = factory.createDomain(FRIEND).value;

    expect(friend.toAnemic().login).toBe('maybeitsvero');
    expect(friend.toEvents().map((event) => event.event_name)).toEqual([
      'friend_added',
    ]);
  });

  it('can be removed and added again under the same id', () => {
    const friend = factory.createDomain(FRIEND).value;
    const id = friend.toAnemic().id;

    expect(friend.remove().isSuccess).toBe(true);
    expect(friend.readd({ ...FRIEND, display_name: 'Vero' }).isSuccess).toBe(
      true,
    );
    expect(friend.toAnemic()).toMatchObject({
      id,
      display_name: 'Vero',
      deleted_at: null,
    });
  });

  it('does not add an active friend twice', () => {
    const friend = factory.createDomain(FRIEND).value;

    expect(friend.readd(FRIEND).isFailure).toBe(true);
  });
});
