import type {
  AuthorId,
  CategoryId,
  MediaId,
  PostAnemic,
  PostId,
  PostStatus,
  TagId,
} from '@toxictoast/blog-domain';
import type { Nullable } from '@toxictoast/shared-kernel';
import type { Mapper } from '@toxictoast/shared-persistence';
import type { PostRecord } from '../interfaces/index.js';

export class PostMapper implements Mapper<PostAnemic, PostRecord> {
  toAnemic(record: PostRecord): PostAnemic {
    const { post } = record;
    return {
      id: post.id as PostId,
      author_id: post.author_id as AuthorId,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      status: post.status as PostStatus,
      featured: post.featured,
      reading_time: post.reading_time,
      category_ids: record.categories.map((row) => {
        return row.category_id as CategoryId;
      }),
      tag_ids: record.tags.map((row) => row.tag_id as TagId),
      blog_image_id: post.blog_image_id as Nullable<MediaId>,
      hero_image_id: post.hero_image_id as Nullable<MediaId>,
      published_at: post.published_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      deleted_at: post.deleted_at,
    };
  }

  toRow(anemic: PostAnemic): PostRecord {
    return {
      post: {
        id: anemic.id,
        author_id: anemic.author_id,
        title: anemic.title,
        slug: anemic.slug,
        excerpt: anemic.excerpt,
        content: anemic.content,
        status: anemic.status,
        featured: anemic.featured,
        reading_time: anemic.reading_time,
        blog_image_id: anemic.blog_image_id,
        hero_image_id: anemic.hero_image_id,
        published_at: anemic.published_at,
        created_at: anemic.created_at,
        updated_at: anemic.updated_at,
        deleted_at: anemic.deleted_at,
      },
      categories: anemic.category_ids.map((category_id, position) => {
        return { post_id: anemic.id, category_id, position };
      }),
      tags: anemic.tag_ids.map((tag_id, position) => {
        return { post_id: anemic.id, tag_id, position };
      }),
    };
  }
}
