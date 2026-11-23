import { eventKey, type PayloadReader } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { StreamStatusChange } from '@toxictoast/twitch-application';
import { STREAM_STATUS_KEY } from '../constants/index.js';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { channelOf } from './channel-of.function.js';

export const streamStatusChangeOf = (
  event: IncomingTwitchEvent,
  payload: PayloadReader,
): Nullable<StreamStatusChange> => {
  if (eventKey(event.event_namespace, event.event_name) !== STREAM_STATUS_KEY) {
    return null;
  }
  return {
    channel: channelOf(payload),
    stream_id: payload.string('stream_id'),
    status: {
      title: payload.string('title'),
      game_id: payload.string('game_id'),
      game_name: payload.string('game_name'),
      viewer_count: payload.number('viewer_count'),
    },
  };
};
