import { TwitchVideoType } from '@toxictoast/contracts-grpc';
import { enumNames } from '../../../common/functions/index.js';

export const VIDEO_TYPES = {
  archive: TwitchVideoType.TWITCH_VIDEO_TYPE_ARCHIVE,
  highlight: TwitchVideoType.TWITCH_VIDEO_TYPE_HIGHLIGHT,
  upload: TwitchVideoType.TWITCH_VIDEO_TYPE_UPLOAD,
} as const;

export const VIDEO_TYPE_NAMES = enumNames(VIDEO_TYPES);
