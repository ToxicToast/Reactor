import type { TwitchObservation } from '@toxictoast/twitch-domain';

export type ObservationParts = Pick<TwitchObservation, 'kind'> &
  Partial<Omit<TwitchObservation, 'event_id' | 'kind' | 'channel'>>;
