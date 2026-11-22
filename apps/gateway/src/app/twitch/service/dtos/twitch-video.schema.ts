import { z } from 'zod';
import { enumKeys } from '../../../common/functions/index.js';
import { VIDEO_TYPES } from '../constants/index.js';

export const TwitchVideoSchema = z.object({
  video_id: z.string(),
  channel_id: z.string(),
  stream_id: z.string().optional(),
  type: z.enum(enumKeys(VIDEO_TYPES)).optional(),
  title: z.string(),
  description: z.string(),
  url: z.string(),
  thumbnail_url: z.string(),
  duration_seconds: z.number().int(),
  language: z.string(),
  created_at: z.string(),
  published_at: z.string(),
});
