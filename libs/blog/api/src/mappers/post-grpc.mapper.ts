import type { PostAnemic } from '@toxictoast/blog-domain';
import type { Post } from '@toxictoast/contracts-grpc';
import { toIso } from '@toxictoast/shared-grpc';
import { POST_STATUS_TO_GRPC } from '../mappings/index.js';

export class PostGrpcMapper {
  toProto(anemic: PostAnemic): Post {
    return {
      id: anemic.id,
      author_id: anemic.author_id,
      title: anemic.title,
      slug: anemic.slug,
      excerpt: anemic.excerpt ?? undefined,
      content: anemic.content,
      status: POST_STATUS_TO_GRPC[anemic.status],
      featured: anemic.featured,
      reading_time: anemic.reading_time,
      category_ids: [...anemic.category_ids],
      tag_ids: [...anemic.tag_ids],
      blog_image_id: anemic.blog_image_id ?? undefined,
      hero_image_id: anemic.hero_image_id ?? undefined,
      published_at: toIso(anemic.published_at),
      created_at: anemic.created_at.toISOString(),
      updated_at: toIso(anemic.updated_at),
      deleted_at: toIso(anemic.deleted_at),
    };
  }
}
