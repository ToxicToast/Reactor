import {
  PostStatus,
  type AuthorId,
  type PostAnemic,
  type PostId,
} from '@toxictoast/blog-domain';
import { TEST_NOW } from './test-domain-context.js';

export const postAnemic = (
  id: string,
  overrides: Partial<PostAnemic> = {},
): PostAnemic => {
  return {
    id: id as PostId,
    author_id: 'author-1' as AuthorId,
    title: id,
    slug: id,
    excerpt: null,
    content: 'Im grimmigen Dunkel der fernen Zukunft gibt es nur Krieg.',
    status: PostStatus.DRAFT,
    featured: false,
    reading_time: 1,
    category_ids: [],
    tag_ids: [],
    blog_image_id: null,
    hero_image_id: null,
    published_at: null,
    created_at: TEST_NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
