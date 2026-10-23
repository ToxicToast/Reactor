import type { UpdatePostRequest } from '@toxictoast/contracts-grpc';
import type { UpdatePostDto } from '../dtos/index.js';

export const updatePostRequest = (
  id: string,
  body: UpdatePostDto,
): UpdatePostRequest => {
  return {
    id,
    title: body.title ?? '',
    excerpt: body.excerpt ?? undefined,
    content: body.content ?? '',
    featured: body.featured ?? false,
    category_ids: body.category_ids ?? [],
    tag_ids: body.tag_ids ?? [],
    blog_image_id: body.blog_image_id ?? undefined,
    hero_image_id: body.hero_image_id ?? undefined,
    update_mask: Object.keys(body),
  };
};
