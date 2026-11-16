import { TwitchChatDeletionReason } from '@toxictoast/contracts-grpc';
import {
  ChatDeletionReasons,
  type ChatDeletionReason,
} from '@toxictoast/twitch-domain';

export const CHAT_DELETION_REASON_TO_PROTO: Readonly<
  Record<ChatDeletionReason, TwitchChatDeletionReason>
> = {
  [ChatDeletionReasons.DELETED]:
    TwitchChatDeletionReason.TWITCH_CHAT_DELETION_REASON_DELETED,
  [ChatDeletionReasons.BANNED]:
    TwitchChatDeletionReason.TWITCH_CHAT_DELETION_REASON_BANNED,
  [ChatDeletionReasons.TIMED_OUT]:
    TwitchChatDeletionReason.TWITCH_CHAT_DELETION_REASON_TIMED_OUT,
};
