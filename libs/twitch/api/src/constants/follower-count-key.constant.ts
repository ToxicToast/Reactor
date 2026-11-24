import {
  TwitchCommunityEvents,
  TwitchTopics,
} from '@toxictoast/contracts-events';
import { eventKey } from '@toxictoast/shared-kernel';

export const FOLLOWER_COUNT_KEY = eventKey(
  TwitchTopics.COMMUNITY,
  TwitchCommunityEvents.FOLLOWER_COUNT,
);
