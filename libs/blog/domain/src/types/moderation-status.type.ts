import type { CommentStatus } from '../enums/index.js';

export type ModerationStatus = Exclude<CommentStatus, CommentStatus.PENDING>;
