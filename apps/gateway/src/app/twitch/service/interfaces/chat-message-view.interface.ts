import type { ChatMessage } from '@toxictoast/contracts-grpc';
import type { Optional } from '@toxictoast/shared-types';

export interface ChatMessageView extends Omit<ChatMessage, 'deleted_reason'> {
  readonly deleted_reason?: Optional<string>;
}
