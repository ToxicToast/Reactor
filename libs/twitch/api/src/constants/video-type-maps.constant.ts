import { TwitchVideoType } from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import { VideoTypes, type VideoType } from '@toxictoast/twitch-domain';

export const VIDEO_TYPE_TO_PROTO: Readonly<Record<VideoType, TwitchVideoType>> =
  {
    [VideoTypes.ARCHIVE]: TwitchVideoType.TWITCH_VIDEO_TYPE_ARCHIVE,
    [VideoTypes.HIGHLIGHT]: TwitchVideoType.TWITCH_VIDEO_TYPE_HIGHLIGHT,
    [VideoTypes.UPLOAD]: TwitchVideoType.TWITCH_VIDEO_TYPE_UPLOAD,
  };

export const VIDEO_TYPE_FROM_PROTO: Readonly<
  Record<TwitchVideoType, Nullable<VideoType>>
> = {
  [TwitchVideoType.TWITCH_VIDEO_TYPE_UNSPECIFIED]: null,
  [TwitchVideoType.TWITCH_VIDEO_TYPE_ARCHIVE]: VideoTypes.ARCHIVE,
  [TwitchVideoType.TWITCH_VIDEO_TYPE_HIGHLIGHT]: VideoTypes.HIGHLIGHT,
  [TwitchVideoType.TWITCH_VIDEO_TYPE_UPLOAD]: VideoTypes.UPLOAD,
};
