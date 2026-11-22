import { paginate } from '@toxictoast/shared-application/testing';
import type { Optional } from '@toxictoast/shared-types';
import {
  FollowStates,
  type Follow,
  type FollowFilter,
  type FollowRepository,
  type ViewerRef,
} from '@toxictoast/twitch-domain';

export class InMemoryFollowRepository implements FollowRepository {
  items: Array<Follow> = [];

  async follow(
    channelId: string,
    viewer: ViewerRef,
    followedAt: Date,
  ): Promise<boolean> {
    if (this.open(channelId, viewer.user_id)) {
      return false;
    }
    this.items.push({
      channel_id: channelId,
      user_id: viewer.user_id,
      user_login: viewer.user_login,
      user_name: viewer.user_name,
      followed_at: followedAt,
      unfollowed_at: null,
    });
    return true;
  }

  async unfollow(
    channelId: string,
    userId: string,
    at: Date,
  ): Promise<boolean> {
    const open = this.open(channelId, userId);
    if (!open) {
      return false;
    }
    this.items = this.items.map((item) => {
      return item === open ? { ...item, unfollowed_at: at } : item;
    });
    return true;
  }

  async list(
    filter: FollowFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Follow>> {
    const matching = this.items
      .filter((item) => item.channel_id === filter.channel_id)
      .filter((item) => {
        return filter.user_id === null || item.user_id === filter.user_id;
      })
      .filter((item) => {
        if (filter.state === FollowStates.ACTIVE) {
          return item.unfollowed_at === null;
        }
        if (filter.state === FollowStates.ENDED) {
          return item.unfollowed_at !== null;
        }
        return true;
      })
      .sort((a, b) => b.followed_at.getTime() - a.followed_at.getTime());
    return paginate(matching, limit, offset);
  }

  private open(channelId: string, userId: string): Follow | undefined {
    return this.items.find((item) => {
      return (
        item.channel_id === channelId &&
        item.user_id === userId &&
        item.unfollowed_at === null
      );
    });
  }
}
