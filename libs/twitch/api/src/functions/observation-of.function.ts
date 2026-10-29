import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchObservation } from '@toxictoast/twitch-domain';
import { OBSERVATION_MAPPERS } from '../constants/observation-mappers.constant.js';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { channelOf } from './channel-of.function.js';
import { mapperFor } from './mapper-for.function.js';

export const observationOf = (
  event: IncomingTwitchEvent,
  payload: PayloadReader,
  occurredAt: Date,
): Nullable<TwitchObservation> => {
  const mapper = mapperFor(OBSERVATION_MAPPERS, event);
  if (!mapper) {
    return null;
  }

  return {
    event_id: event.event_id,
    channel: channelOf(payload),
    occurred_at: occurredAt,
    user: null,
    amount: 0,
    gifted: false,
    reward: null,
    poll: null,
    stream_id: null,
    ...mapper(payload),
  };
};
