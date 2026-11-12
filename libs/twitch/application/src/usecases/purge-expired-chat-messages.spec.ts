import type { ChatMessage } from '@toxictoast/twitch-domain';
import {
  InMemoryChatMessageRepository,
  postedChatMessage,
} from '../testing/index.js';
import { PurgeExpiredChatMessagesUseCase } from './purge-expired-chat-messages.usecase.js';

const NOW = new Date('2026-11-11T03:45:00Z');

const stored = (id: string, sentAt: string): ChatMessage => {
  return {
    ...postedChatMessage(id, { sent_at: new Date(sentAt) }),
    session_id: null,
    deleted_at: null,
    deleted_reason: null,
  };
};

describe('PurgeExpiredChatMessagesUseCase', () => {
  it('deletes messages older than the retention and keeps the rest', async () => {
    const messages = new InMemoryChatMessageRepository();
    await messages.record(stored('old', '2025-11-10T00:00:00Z'));
    await messages.record(stored('fresh', '2026-11-01T00:00:00Z'));
    const useCase = new PurgeExpiredChatMessagesUseCase(
      messages,
      { retention_days: 365 },
      { now: () => NOW },
    );

    const result = await useCase.execute();

    expect(result.value).toEqual({ removed: 1 });
    expect([...messages.items.keys()]).toEqual(['fresh']);
  });
});
