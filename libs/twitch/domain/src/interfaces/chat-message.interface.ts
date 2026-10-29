import type { Nullable } from '@toxictoast/shared-types';
import type { ChatDeletionReason } from '../types/index.js';
import type { ViewerRef } from './viewer-ref.interface.js';

export interface ChatMessage extends ViewerRef {
  readonly message_id: string;
  readonly channel_id: string;
  readonly text: string;
  readonly color: Nullable<string>;
  readonly badges: ReadonlyArray<string>;
  readonly bits: number;
  readonly reply_to_message_id: Nullable<string>;
  readonly session_id: Nullable<string>;
  readonly sent_at: Date;
  readonly deleted_at: Nullable<Date>;
  readonly deleted_reason: Nullable<ChatDeletionReason>;
}
