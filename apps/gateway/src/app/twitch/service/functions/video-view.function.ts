import type { TwitchVideo } from '@toxictoast/contracts-grpc';
import { VIDEO_TYPE_NAMES } from '../constants/index.js';
import type { VideoView } from '../interfaces/index.js';

export const videoView = (video: TwitchVideo): VideoView => {
  const { type, ...rest } = video;
  return { ...rest, type: VIDEO_TYPE_NAMES[type] };
};
