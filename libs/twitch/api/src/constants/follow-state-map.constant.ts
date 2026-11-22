import { TwitchFollowState } from '@toxictoast/contracts-grpc';
import { FollowStates, type FollowState } from '@toxictoast/twitch-domain';

/** UNSPECIFIED heißt „alle“, damit der Filter optional bleibt */
export const FOLLOW_STATE_MAP: Readonly<
  Record<TwitchFollowState, FollowState>
> = {
  [TwitchFollowState.TWITCH_FOLLOW_STATE_UNSPECIFIED]: FollowStates.ALL,
  [TwitchFollowState.TWITCH_FOLLOW_STATE_ACTIVE]: FollowStates.ACTIVE,
  [TwitchFollowState.TWITCH_FOLLOW_STATE_ENDED]: FollowStates.ENDED,
};
