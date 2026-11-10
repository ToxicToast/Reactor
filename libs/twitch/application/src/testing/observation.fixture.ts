import {
  ObservationKinds,
  type TwitchObservation,
  type ViewerRef,
} from '@toxictoast/twitch-domain';
import { TWITCH_TEST_CHANNEL, TWITCH_TEST_NOW } from './test-context.js';

export const viewer = (id: string): ViewerRef => {
  return { user_id: id, user_login: `user${id}`, user_name: `User${id}` };
};

let sequence = 0;

export const observation = (
  overrides: Partial<TwitchObservation> = {},
): TwitchObservation => {
  sequence++;
  return {
    event_id: `event-${sequence}`,
    kind: ObservationKinds.MESSAGE,
    channel: TWITCH_TEST_CHANNEL,
    occurred_at: TWITCH_TEST_NOW,
    user: null,
    amount: 0,
    gifted: false,
    reward: null,
    poll: null,
    stream_id: null,
    ...overrides,
  };
};
