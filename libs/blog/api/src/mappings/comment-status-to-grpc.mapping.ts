import { CommentStatus } from '@toxictoast/blog-domain';
import { CommentStatus as GrpcCommentStatus } from '@toxictoast/contracts-grpc';

export const COMMENT_STATUS_TO_GRPC: Readonly<
  Record<CommentStatus, GrpcCommentStatus>
> = {
  [CommentStatus.PENDING]: GrpcCommentStatus.COMMENT_STATUS_PENDING,
  [CommentStatus.APPROVED]: GrpcCommentStatus.COMMENT_STATUS_APPROVED,
  [CommentStatus.SPAM]: GrpcCommentStatus.COMMENT_STATUS_SPAM,
  [CommentStatus.HATE]: GrpcCommentStatus.COMMENT_STATUS_HATE,
};
