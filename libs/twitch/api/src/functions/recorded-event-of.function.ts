import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { RecordedTwitchEvent } from '@toxictoast/twitch-application';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { eventChannelIdOf } from './event-channel-id-of.function.js';

export const recordedEventOf = (
  event: IncomingTwitchEvent,
  payload: PayloadReader,
  occurredAt: Date,
): RecordedTwitchEvent => {
  return {
    event_id: event.event_id,
    topic: event.event_namespace,
    name: event.event_name,
    channel_id: eventChannelIdOf(payload),
    occurred_at: occurredAt,
    payload: payload.object,
  };
};
