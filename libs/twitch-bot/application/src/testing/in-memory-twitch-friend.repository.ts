import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  TwitchFriendAnemic,
  TwitchFriendId,
  TwitchFriendRepository,
} from '@toxictoast/twitch-bot-domain';

export class InMemoryTwitchFriendRepository implements TwitchFriendRepository {
  readonly items = new Map<TwitchFriendId, TwitchFriendAnemic>();

  async save(anemic: TwitchFriendAnemic): Promise<TwitchFriendAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<TwitchFriendAnemic>> {
    const friends = [...this.items.values()].filter((friend) => {
      return withDeleted || friend.deleted_at === null;
    });
    return friends.slice(
      offset,
      limit === undefined ? undefined : offset + limit,
    );
  }

  async findById(
    id: TwitchFriendId,
    withDeleted = false,
  ): Promise<Nullable<TwitchFriendAnemic>> {
    const friend = this.items.get(id) ?? null;
    if (friend && !withDeleted && friend.deleted_at !== null) {
      return null;
    }
    return friend;
  }

  async findByTwitchId(
    twitchId: string,
    withDeleted = false,
  ): Promise<Nullable<TwitchFriendAnemic>> {
    return (
      [...this.items.values()].find((friend) => {
        return (
          friend.twitch_id === twitchId &&
          (withDeleted || friend.deleted_at === null)
        );
      }) ?? null
    );
  }
}
