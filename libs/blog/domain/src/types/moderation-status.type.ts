import type { CommentStatus } from '../enums/index.js';

export type ModerationStatus = Exclude<
  CommentStatus,
  typeof CommentStatus.PENDING
>;
