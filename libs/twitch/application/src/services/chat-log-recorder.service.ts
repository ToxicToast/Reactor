import {
  ChatDeletionReasons,
  type ChatMessageRepository,
  type StreamSessionRepository,
} from '@toxictoast/twitch-domain';
import { CHAT_LOG, ChatChangeKinds } from '../constants/index.js';
import type { ChatChange, PostedChatMessage } from '../types/index.js';

export class ChatLogRecorder {
  constructor(
    private readonly messages: ChatMessageRepository,
    private readonly sessions: StreamSessionRepository,
  ) {}

  async record(change: ChatChange): Promise<void> {
    switch (change.kind) {
      case ChatChangeKinds.POSTED:
        return this.post(change.message);
      case ChatChangeKinds.DELETED:
        await this.messages.markDeleted(
          change.channel_id,
          change.message_id,
          change.at,
          ChatDeletionReasons.DELETED,
        );
        return;
      case ChatChangeKinds.CLEARED:
        await this.messages.markUserCleared(
          change.channel_id,
          change.user_id,
          new Date(change.at.getTime() - CHAT_LOG.CLEAR_WINDOW_MS),
          change.at,
          change.reason,
        );
        return;
    }
  }

  private async post(message: PostedChatMessage): Promise<void> {
    const live = await this.sessions.findLive(message.channel_id);
    await this.messages.record({
      ...message,
      session_id: live?.id ?? null,
      deleted_at: null,
      deleted_reason: null,
    });
  }
}
