import type { Nullable } from '@toxictoast/shared-types';
import type { TwitchObservation } from '@toxictoast/twitch-domain';
import type { RecordedTwitchEvent } from '../interfaces/index.js';

export interface RecordTwitchEventInput {
  readonly event: RecordedTwitchEvent;
  readonly observation: Nullable<TwitchObservation>;
}

export interface RecordTwitchEventOutput {
  readonly recorded: boolean;
}
