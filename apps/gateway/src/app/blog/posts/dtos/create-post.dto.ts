import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CreatePostDto extends createZodDto(
  z.object({
    title: z.string().trim().min(1).max(200),
    excerpt: z.string().trim().max(500).optional(),
    content: z.string().min(1),
    featured: z.boolean().default(false),
    category_ids: z.array(z.uuid()).default([]),
    tag_ids: z.array(z.uuid()).default([]),
    blog_image_id: z.uuid().optional(),
    hero_image_id: z.uuid().optional(),
  }),
) {}
