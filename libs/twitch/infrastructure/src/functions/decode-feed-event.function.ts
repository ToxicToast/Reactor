import type { RecordedTwitchEvent } from '@toxictoast/twitch-application';

type EncodedEvent = Omit<RecordedTwitchEvent, 'occurred_at'> & {
  readonly occurred_at: string;
};

export const decodeFeedEvent = (message: string): RecordedTwitchEvent => {
  const event = JSON.parse(message) as EncodedEvent;
  return { ...event, occurred_at: new Date(event.occurred_at) };
};
