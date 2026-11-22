import { TwitchChatDeletionReason } from '@toxictoast/contracts-grpc';
import { enumNames } from '../../../common/functions/index.js';

export const CHAT_DELETION_REASONS = {
  deleted: TwitchChatDeletionReason.TWITCH_CHAT_DELETION_REASON_DELETED,
  banned: TwitchChatDeletionReason.TWITCH_CHAT_DELETION_REASON_BANNED,
  timed_out: TwitchChatDeletionReason.TWITCH_CHAT_DELETION_REASON_TIMED_OUT,
} as const;

export const CHAT_DELETION_REASON_NAMES = enumNames(CHAT_DELETION_REASONS);
