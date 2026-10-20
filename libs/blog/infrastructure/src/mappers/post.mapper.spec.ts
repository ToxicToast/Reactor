import {
  PostStatus,
  type AuthorId,
  type CategoryId,
  type MediaId,
  type PostAnemic,
  type PostId,
  type TagId,
} from '@toxictoast/blog-domain';
import { PostMapper } from './post.mapper.js';

const ANEMIC: PostAnemic = {
  id: 'post-1' as PostId,
  author_id: 'author-1' as AuthorId,
  title: 'Warhammer 40k',
  slug: 'warhammer-40k',
  excerpt: 'Im grimmigen Dunkel',
  content: 'Es gibt nur Krieg.',
  status: PostStatus.PUBLISHED,
  featured: true,
  reading_time: 3,
  category_ids: ['cat-2' as CategoryId, 'cat-1' as CategoryId],
  tag_ids: ['tag-1' as TagId],
  blog_image_id: 'media-1' as MediaId,
  hero_image_id: null,
  published_at: new Date('2026-10-20T10:00:00Z'),
  created_at: new Date('2026-10-19T10:00:00Z'),
  updated_at: null,
  deleted_at: null,
};

describe('PostMapper', () => {
  const mapper = new PostMapper();

  it('maps to a record and back without losing data', () => {
    expect(mapper.toAnemic(mapper.toRow(ANEMIC))).toEqual(ANEMIC);
  });

  it('keeps the order of categories as position', () => {
    const record = mapper.toRow(ANEMIC);

    expect(record.categories).toEqual([
      { post_id: 'post-1', category_id: 'cat-2', position: 0 },
      { post_id: 'post-1', category_id: 'cat-1', position: 1 },
    ]);
  });
});
