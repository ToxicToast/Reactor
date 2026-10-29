import type { ChatChangeKinds } from '../constants/index.js';
import type { PostedChatMessage } from '../types/index.js';

export interface ChatMessagePosted {
  readonly kind: typeof ChatChangeKinds.POSTED;
  readonly message: PostedChatMessage;
}
