import { z } from 'zod';

export const TwitchClipSchema = z.object({
  clip_id: z.string(),
  channel_id: z.string(),
  url: z.string(),
  title: z.string(),
  creator_id: z.string(),
  creator_name: z.string(),
  duration_seconds: z.number(),
  thumbnail_url: z.string(),
  vod_id: z.string().optional(),
  vod_offset: z.number().int().optional(),
  created_at: z.string(),
});
