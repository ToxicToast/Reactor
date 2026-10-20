import { MediaStatus } from '@toxictoast/blog-domain';
import { MediaStatus as GrpcMediaStatus } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';

export const MEDIA_STATUS_FROM_GRPC: Readonly<
  Record<GrpcMediaStatus, Nullable<MediaStatus>>
> = {
  [GrpcMediaStatus.MEDIA_STATUS_UNSPECIFIED]: null,
  [GrpcMediaStatus.MEDIA_STATUS_PENDING]: MediaStatus.PENDING,
  [GrpcMediaStatus.MEDIA_STATUS_READY]: MediaStatus.READY,
};
