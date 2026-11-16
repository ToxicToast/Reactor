import type { ChatMessage } from '@toxictoast/contracts-grpc';
import { CHAT_DELETION_REASON_NAMES } from '../constants/index.js';
import type { ChatMessageView } from '../interfaces/index.js';

export const chatMessageView = (message: ChatMessage): ChatMessageView => {
  const { deleted_reason, ...rest } = message;
  return {
    ...rest,
    deleted_reason: CHAT_DELETION_REASON_NAMES[deleted_reason],
  };
};
