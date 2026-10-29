import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { TwitchObservation } from '@toxictoast/twitch-domain';
import type { RecordedTwitchEvent } from '../interfaces/index.js';
import type { ChatChange } from '../types/index.js';

export interface RecordTwitchEventInput {
  readonly event: RecordedTwitchEvent;
  readonly observation: Nullable<TwitchObservation>;
  readonly chat?: Optional<Nullable<ChatChange>>;
}

export interface RecordTwitchEventOutput {
  readonly recorded: boolean;
}
