import { TwitchStreamEvents, TwitchTopics } from '@toxictoast/contracts-events';
import { eventKey } from '@toxictoast/shared-kernel';

export const STREAM_STATUS_KEY = eventKey(
  TwitchTopics.STREAM,
  TwitchStreamEvents.STATUS,
);
