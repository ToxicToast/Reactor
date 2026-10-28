import { ObservationKinds } from '../constants/index.js';
import type { StatsEffect, TwitchObservation } from '../interfaces/index.js';
import type { SessionCounters, ViewerCounters } from '../types/index.js';

const effect = (
  counters: Partial<SessionCounters>,
  viewer: Partial<ViewerCounters> = {},
  countsAsChatter = false,
): StatsEffect => {
  return { counters, viewer, counts_as_chatter: countsAsChatter };
};

const NO_EFFECT = effect({});

export const statsEffectOf = (observation: TwitchObservation): StatsEffect => {
  const amount = observation.amount;
  switch (observation.kind) {
    case ObservationKinds.MESSAGE:
      return effect({ messages: 1 }, { messages: 1 }, true);
    case ObservationKinds.FOLLOW:
      return effect({ follows: 1 });
    case ObservationKinds.SUBSCRIPTION:
      return observation.gifted ? NO_EFFECT : effect({ subscriptions: 1 });
    case ObservationKinds.RESUBSCRIPTION:
      return effect({ resubscriptions: 1 });
    case ObservationKinds.GIFT:
      return effect({ gifted_subs: amount }, { gifted_subs: amount });
    case ObservationKinds.CHEER:
      return effect({ bits: amount }, { bits: amount });
    case ObservationKinds.RAID:
      return effect({ raids: 1, raid_viewers: amount });
    case ObservationKinds.REDEMPTION:
      return effect({ redemptions: 1 }, { redemptions: 1 });
    default:
      return NO_EFFECT;
  }
};
