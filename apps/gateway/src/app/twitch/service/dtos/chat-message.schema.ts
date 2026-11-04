import { z } from 'zod';

export const ChatMessageSchema = z.object({
  message_id: z.string(),
  channel_id: z.string(),
  user_id: z.string(),
  user_login: z.string(),
  user_name: z.string(),
  text: z.string(),
  color: z.string().optional(),
  badges: z.array(z.string()),
  bits: z.number().int(),
  reply_to_message_id: z.string().optional(),
  session_id: z.uuid().optional(),
  sent_at: z.string(),
  deleted_at: z.string().optional(),
  deleted_reason: z.enum(['deleted', 'banned', 'timed_out']).optional(),
});
