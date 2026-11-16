import { z } from 'zod';
import { enumKeys } from '../../../common/functions/index.js';
import { CHAT_DELETION_REASONS } from '../constants/index.js';

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
  deleted_reason: z.enum(enumKeys(CHAT_DELETION_REASONS)).optional(),
});
