import type { ModerationStatus } from '@toxictoast/blog-application';
import { CommentStatus } from '@toxictoast/blog-domain';
import { ModerationStatus as GrpcModerationStatus } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-kernel';

export const MODERATION_STATUS_FROM_GRPC: Readonly<
  Record<GrpcModerationStatus, Nullable<ModerationStatus>>
> = {
  [GrpcModerationStatus.MODERATION_STATUS_UNSPECIFIED]: null,
  [GrpcModerationStatus.MODERATION_STATUS_APPROVED]: CommentStatus.APPROVED,
  [GrpcModerationStatus.MODERATION_STATUS_SPAM]: CommentStatus.SPAM,
  [GrpcModerationStatus.MODERATION_STATUS_HATE]: CommentStatus.HATE,
};
