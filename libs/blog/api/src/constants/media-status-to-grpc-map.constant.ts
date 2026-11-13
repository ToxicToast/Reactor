import { MediaStatus } from '@toxictoast/blog-domain';
import { MediaStatus as GrpcMediaStatus } from '@toxictoast/contracts-grpc';

export const MEDIA_STATUS_TO_GRPC: Readonly<
  Record<MediaStatus, GrpcMediaStatus>
> = {
  [MediaStatus.PENDING]: GrpcMediaStatus.MEDIA_STATUS_PENDING,
  [MediaStatus.READY]: GrpcMediaStatus.MEDIA_STATUS_READY,
};
