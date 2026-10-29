import type { ChatMessage } from '@toxictoast/twitch-domain';

export type PostedChatMessage = Omit<
  ChatMessage,
  'session_id' | 'deleted_at' | 'deleted_reason'
>;
