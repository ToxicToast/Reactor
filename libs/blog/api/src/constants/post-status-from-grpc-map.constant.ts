import { PostStatus } from '@toxictoast/blog-domain';
import { PostStatus as GrpcPostStatus } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';

export const POST_STATUS_FROM_GRPC: Readonly<
  Record<GrpcPostStatus, Nullable<PostStatus>>
> = {
  [GrpcPostStatus.POST_STATUS_UNSPECIFIED]: null,
  [GrpcPostStatus.POST_STATUS_DRAFT]: PostStatus.DRAFT,
  [GrpcPostStatus.POST_STATUS_PUBLISHED]: PostStatus.PUBLISHED,
  [GrpcPostStatus.POST_STATUS_ARCHIVED]: PostStatus.ARCHIVED,
};
