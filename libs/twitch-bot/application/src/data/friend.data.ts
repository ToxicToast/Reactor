import type { TwitchFriendId } from '@toxictoast/twitch-bot-domain';

export interface AddFriendInput {
  readonly login: string;
}

export interface RemoveFriendInput {
  readonly id: TwitchFriendId;
}
