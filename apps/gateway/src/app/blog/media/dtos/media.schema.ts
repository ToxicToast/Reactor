import { MediaStatus } from '@toxictoast/contracts-grpc';
import { z } from 'zod';

export const MediaSchema = z.object({
  id: z.uuid(),
  object_key: z.string(),
  filename: z.string(),
  mime_type: z.string(),
  size: z.number().int(),
  alt_text: z.string().optional(),
  status: z.enum(MediaStatus),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});
