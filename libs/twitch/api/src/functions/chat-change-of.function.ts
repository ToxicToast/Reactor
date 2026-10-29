import type { PayloadReader } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { ChatChange } from '@toxictoast/twitch-application';
import { CHAT_CHANGE_MAPPERS } from '../constants/chat-change-mappers.constant.js';
import type { IncomingTwitchEvent } from '../interfaces/index.js';
import { mapperFor } from './mapper-for.function.js';

export const chatChangeOf = (
  event: IncomingTwitchEvent,
  payload: PayloadReader,
  occurredAt: Date,
): Nullable<ChatChange> => {
  const mapper = mapperFor(CHAT_CHANGE_MAPPERS, event);
  return mapper ? mapper(payload, occurredAt) : null;
};
