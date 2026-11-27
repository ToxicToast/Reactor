import {
  normalizeScopes,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import { YOUTUBE_CHANNEL_PATTERNS } from '../constants/index.js';
import type { YouTubeChannelData } from '../data/index.js';

export const normalizeYouTubeChannelData = (
  data: YouTubeChannelData,
): Result<YouTubeChannelData> => {
  const youtubeId = data.youtube_id.trim();
  if (!YOUTUBE_CHANNEL_PATTERNS.CHANNEL_ID.test(youtubeId)) {
    return Result.fail(
      new ValidationError(`Invalid youtube channel id ${data.youtube_id}`),
    );
  }

  const title = data.title.trim();
  if (title.length === 0) {
    return Result.fail(new ValidationError('Title must not be empty'));
  }

  const handle = data.handle?.trim() ?? '';
  return Result.ok({
    youtube_id: youtubeId,
    handle: handle.length === 0 ? null : handle,
    title,
    scopes: normalizeScopes(data.scopes),
  });
};
