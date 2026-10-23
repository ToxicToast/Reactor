import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class UpdatePostDto extends createZodDto(
  z
    .object({
      title: z.string().trim().min(1).max(200),
      excerpt: z.string().trim().max(500).nullable(),
      content: z.string().min(1),
      featured: z.boolean(),
      category_ids: z.array(z.uuid()),
      tag_ids: z.array(z.uuid()),
      blog_image_id: z.uuid().nullable(),
      hero_image_id: z.uuid().nullable(),
    })
    .partial()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'at least one field is required',
    }),
) {}
