import type { ChatDeletionReasons } from '../constants/index.js';

export type ChatDeletionReason =
  (typeof ChatDeletionReasons)[keyof typeof ChatDeletionReasons];
