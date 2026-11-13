import type { RecordedTwitchEvent } from '@toxictoast/twitch-application';

export type EncodedFeedEvent = Omit<RecordedTwitchEvent, 'occurred_at'> & {
  readonly occurred_at: string;
};
