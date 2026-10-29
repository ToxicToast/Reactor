import type { ChatChangeKinds } from '../constants/index.js';

export interface ChatMessageDeleted {
  readonly kind: typeof ChatChangeKinds.DELETED;
  readonly channel_id: string;
  readonly message_id: string;
  readonly at: Date;
}
