import { parseIsoDate, type PayloadReader } from '@toxictoast/shared-kernel';
import type { RecordTwitchEventInput } from '@toxictoast/twitch-application';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { observationOf } from './observation-of.function.js';
import { recordedEventOf } from './recorded-event-of.function.js';

export const recordInputOf = (
  event: IncomingTwitchEvent,
  payload: PayloadReader,
): RecordTwitchEventInput => {
  const occurredAt = parseIsoDate(event.occurred_at, 'occurred_at');
  return {
    event: recordedEventOf(event, payload, occurredAt),
    observation: observationOf(event, payload, occurredAt),
  };
};
