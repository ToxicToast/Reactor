import type {
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import {
  diffByUserId,
  uniqueByUserId,
  type Follower,
  type FollowerRepository,
  type TwitchChannelAnemic,
  type TwitchChannelRepository,
  type UserDiff,
} from '@toxictoast/twitch-bot-domain';
import { FOLLOWER_EVENTS } from '../constants/index.js';
import type { SyncFollowersOutput } from '../data/index.js';
import { followerPayloadOf, observe } from '../functions/index.js';
import type { TwitchFollowerSource } from '../interfaces/index.js';

export class SyncFollowersUseCase implements UseCase<
  void,
  SyncFollowersOutput
> {
  constructor(
    private readonly channels: TwitchChannelRepository,
    private readonly followers: FollowerRepository,
    private readonly source: TwitchFollowerSource,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<SyncFollowersOutput>> {
    let followed = 0;
    let unfollowed = 0;

    for (const channel of await this.channels.findConnected()) {
      const diff = await this.sync(channel);
      followed += diff.added.length;
      unfollowed += diff.removed.length;
    }

    return Result.ok({ followed, unfollowed });
  }

  private async sync(
    channel: TwitchChannelAnemic,
  ): Promise<UserDiff<Follower>> {
    const current = uniqueByUserId(await this.source.listFollowers(channel));
    const previous = await this.followers.findByChannel(channel.id);
    const diff = diffByUserId(previous, current);
    if (diff.added.length === 0 && diff.removed.length === 0) {
      return diff;
    }

    const found = [...diff.added]
      .sort((a, b) => a.followed_at.getTime() - b.followed_at.getTime())
      .map((follower) => {
        return observe(
          this.ctx,
          channel,
          FOLLOWER_EVENTS.TOPIC,
          FOLLOWER_EVENTS.FOUND,
          followerPayloadOf(follower),
        );
      });
    const lost = diff.removed.map((follower) => {
      return observe(
        this.ctx,
        channel,
        FOLLOWER_EVENTS.TOPIC,
        FOLLOWER_EVENTS.UNFOLLOW,
        followerPayloadOf(follower),
      );
    });

    await this.uow.run(async () => {
      await this.followers.replace(channel.id, current);
      await this.outbox.add([...found, ...lost]);
    });
    return diff;
  }
}
