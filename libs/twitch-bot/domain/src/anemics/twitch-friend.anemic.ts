import type { Anemic } from '@toxictoast/shared-kernel';
import type { TwitchIdentity } from '../interfaces/index.js';
import type { TwitchFriendId } from '../types/index.js';

export interface TwitchFriendAnemic
  extends Anemic<TwitchFriendId>, TwitchIdentity {}
