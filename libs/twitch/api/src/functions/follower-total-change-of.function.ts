import { eventKey, type PayloadReader } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { FollowerTotalChange } from '@toxictoast/twitch-application';
import { FOLLOWER_COUNT_KEY } from '../constants/follower-count-key.constant.js';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { channelOf } from './channel-of.function.js';

export const followerTotalChangeOf = (
  event: IncomingTwitchEvent,
  payload: PayloadReader,
  occurredAt: Date,
): Nullable<FollowerTotalChange> => {
  if (
    eventKey(event.event_namespace, event.event_name) !== FOLLOWER_COUNT_KEY
  ) {
    return null;
  }
  return {
    channel: channelOf(payload),
    total: payload.number('total'),
    observed_at: occurredAt,
  };
};
