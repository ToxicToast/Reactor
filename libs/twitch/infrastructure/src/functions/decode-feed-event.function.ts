import type { RecordedTwitchEvent } from '@toxictoast/twitch-application';
import type { EncodedFeedEvent } from '../types/index.js';

export const decodeFeedEvent = (message: string): RecordedTwitchEvent => {
  const event = JSON.parse(message) as EncodedFeedEvent;
  return { ...event, occurred_at: new Date(event.occurred_at) };
};
