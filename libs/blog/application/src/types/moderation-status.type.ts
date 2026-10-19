import type { CommentStatus } from '@toxictoast/blog-domain';

export type ModerationStatus = Exclude<CommentStatus, CommentStatus.PENDING>;
