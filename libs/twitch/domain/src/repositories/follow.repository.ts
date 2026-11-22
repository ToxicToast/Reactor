import type { Optional } from '@toxictoast/shared-types';
import type { Follow, FollowFilter, ViewerRef } from '../interfaces/index.js';

export interface FollowRepository {
  /** legt einen offenen Follow an; false, wenn schon einer offen ist */
  follow(
    channelId: string,
    viewer: ViewerRef,
    followedAt: Date,
  ): Promise<boolean>;
  /** schließt den offenen Follow; false, wenn keiner offen war */
  unfollow(channelId: string, userId: string, at: Date): Promise<boolean>;
  list(
    filter: FollowFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Follow>>;
}
