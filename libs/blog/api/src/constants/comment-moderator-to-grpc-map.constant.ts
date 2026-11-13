import { CommentModerator } from '@toxictoast/blog-domain';
import { CommentModerator as GrpcCommentModerator } from '@toxictoast/contracts-grpc';

export const COMMENT_MODERATOR_TO_GRPC: Readonly<
  Record<CommentModerator, GrpcCommentModerator>
> = {
  [CommentModerator.AI]: GrpcCommentModerator.COMMENT_MODERATOR_AI,
  [CommentModerator.ADMIN]: GrpcCommentModerator.COMMENT_MODERATOR_ADMIN,
};
