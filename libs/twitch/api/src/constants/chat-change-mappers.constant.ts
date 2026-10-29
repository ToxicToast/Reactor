import {
  TwitchChatEvents,
  TwitchModerationEvents,
  TwitchTopics,
} from '@toxictoast/contracts-events';
import { eventKey } from '@toxictoast/shared-kernel';
import { ChatChangeKinds } from '@toxictoast/twitch-application';
import {
  ChatDeletionReasons,
  type ChatDeletionReason,
} from '@toxictoast/twitch-domain';
import { viewerOf } from '../functions/viewer-of.function.js';
import type { ChatChangeMapper } from '../types/index.js';

const cleared = (reason: ChatDeletionReason): ChatChangeMapper => {
  return (payload, at) => {
    return {
      kind: ChatChangeKinds.CLEARED,
      channel_id: payload.string('channel_id'),
      user_id: payload.string('user_id'),
      reason,
      at,
    };
  };
};

export const CHAT_CHANGE_MAPPERS: Readonly<Record<string, ChatChangeMapper>> = {
  [eventKey(TwitchTopics.CHAT, TwitchChatEvents.MESSAGE)]: (payload, at) => {
    return {
      kind: ChatChangeKinds.POSTED,
      message: {
        message_id: payload.string('message_id'),
        channel_id: payload.string('channel_id'),
        ...viewerOf(payload),
        text: payload.string('text'),
        color: payload.nullableString('color'),
        badges: payload.stringList('badges'),
        bits: payload.number('bits'),
        reply_to_message_id: payload.nullableString('reply_to_message_id'),
        sent_at: at,
      },
    };
  },
  [eventKey(TwitchTopics.CHAT, TwitchChatEvents.MESSAGE_DELETED)]: (
    payload,
    at,
  ) => {
    return {
      kind: ChatChangeKinds.DELETED,
      channel_id: payload.string('channel_id'),
      message_id: payload.string('message_id'),
      at,
    };
  },
  [eventKey(TwitchTopics.MODERATION, TwitchModerationEvents.BAN)]: cleared(
    ChatDeletionReasons.BANNED,
  ),
  [eventKey(TwitchTopics.MODERATION, TwitchModerationEvents.TIMEOUT)]: cleared(
    ChatDeletionReasons.TIMED_OUT,
  ),
};
