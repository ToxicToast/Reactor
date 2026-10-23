import { PostStatus } from '@toxictoast/contracts-grpc';
import { z } from 'zod';

export const PostSchema = z.object({
  id: z.uuid(),
  author_id: z.uuid(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().optional(),
  content: z.string(),
  status: z.enum(PostStatus),
  featured: z.boolean(),
  reading_time: z.number().int(),
  category_ids: z.array(z.uuid()),
  tag_ids: z.array(z.uuid()),
  blog_image_id: z.uuid().optional(),
  hero_image_id: z.uuid().optional(),
  published_at: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional(),
});
