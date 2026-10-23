import { CommentModerator, CommentStatus } from '@toxictoast/contracts-grpc';
import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.uuid(),
  post_id: z.uuid(),
  parent_id: z.uuid().optional(),
  author_id: z.uuid(),
  content: z.string(),
  status: z.enum(CommentStatus),
  moderation_note: z.string().optional(),
  moderated_by: z.enum(CommentModerator).optional(),
  moderated_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});
