import { CommentStatus } from '@toxictoast/blog-domain';
import { CommentStatus as GrpcCommentStatus } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';

export const COMMENT_STATUS_FROM_GRPC: Readonly<
  Record<GrpcCommentStatus, Nullable<CommentStatus>>
> = {
  [GrpcCommentStatus.COMMENT_STATUS_UNSPECIFIED]: null,
  [GrpcCommentStatus.COMMENT_STATUS_PENDING]: CommentStatus.PENDING,
  [GrpcCommentStatus.COMMENT_STATUS_APPROVED]: CommentStatus.APPROVED,
  [GrpcCommentStatus.COMMENT_STATUS_SPAM]: CommentStatus.SPAM,
  [GrpcCommentStatus.COMMENT_STATUS_HATE]: CommentStatus.HATE,
};
