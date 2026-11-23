import type { Repository } from '@toxictoast/shared-kernel';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { TwitchFriendAnemic } from '../anemics/index.js';

export interface TwitchFriendRepository extends Repository<TwitchFriendAnemic> {
  findByTwitchId(
    twitchId: string,
    withDeleted?: Optional<boolean>,
  ): Promise<Nullable<TwitchFriendAnemic>>;
}
