import { PostStatus } from '@toxictoast/blog-domain';
import { PostStatus as GrpcPostStatus } from '@toxictoast/contracts-grpc';

export const POST_STATUS_TO_GRPC: Readonly<Record<PostStatus, GrpcPostStatus>> =
  {
    [PostStatus.DRAFT]: GrpcPostStatus.POST_STATUS_DRAFT,
    [PostStatus.PUBLISHED]: GrpcPostStatus.POST_STATUS_PUBLISHED,
    [PostStatus.ARCHIVED]: GrpcPostStatus.POST_STATUS_ARCHIVED,
  };
