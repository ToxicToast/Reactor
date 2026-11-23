import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { TwitchObservation } from '@toxictoast/twitch-domain';
import type {
  RecordedTwitchEvent,
  StreamStatusChange,
} from '../interfaces/index.js';
import type { ChatChange, MediaChange } from '../types/index.js';

export interface RecordTwitchEventInput {
  readonly event: RecordedTwitchEvent;
  readonly observation: Nullable<TwitchObservation>;
  readonly chat?: Optional<Nullable<ChatChange>>;
  readonly media?: Optional<Nullable<MediaChange>>;
  readonly status?: Optional<Nullable<StreamStatusChange>>;
}

export interface RecordTwitchEventOutput {
  readonly recorded: boolean;
}
