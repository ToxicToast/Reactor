import { z } from 'zod';

const count = z.number().int();

export const StreamSessionSchema = z.object({
  id: z.uuid(),
  channel_id: z.string(),
  channel_login: z.string(),
  channel_name: z.string(),
  stream_id: z.string(),
  started_at: z.string(),
  ended_at: z.string().optional(),
  duration_seconds: count.optional(),
  peak_chatters: count,
  messages: count,
  unique_chatters: count,
  follows: count,
  subscriptions: count,
  resubscriptions: count,
  gifted_subs: count,
  bits: count,
  raids: count,
  raid_viewers: count,
  redemptions: count,
  title: z.string().optional(),
  game_id: z.string().optional(),
  game_name: z.string().optional(),
  viewer_count: count,
  peak_viewers: count,
  average_viewers: count,
});
