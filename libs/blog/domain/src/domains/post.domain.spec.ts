import type { DomainContext } from '@toxictoast/shared-kernel';
import type { PostData } from '../data/index.js';
import { PostStatus } from '../enums/index.js';
import { PostFactory } from '../factories/index.js';
import type { AuthorId, CategoryId, MediaId, TagId } from '../types/index.js';
import type { PostDomain } from './post.domain.js';

const NOW = new Date('2026-10-19T12:00:00Z');
const PAST = new Date('2024-05-01T08:00:00Z');
const FUTURE = new Date('2027-01-01T00:00:00Z');

const ctx: DomainContext = {
  id: { generate: () => 'id-1' as never },
  date: { now: () => NOW },
};

const CATEGORY_ID = 'category-1' as CategoryId;
const TAG_ID = 'tag-1' as TagId;
const MEDIA_ID = 'media-1' as MediaId;

const VALID_DATA: PostData = {
  author_id: 'author-1' as AuthorId,
  title: 'Warhammer 40k',
  excerpt: null,
  content: 'Im grimmigen Dunkel der fernen Zukunft gibt es nur Krieg.',
  featured: false,
  category_ids: [CATEGORY_ID],
  tag_ids: [TAG_ID],
  blog_image_id: null,
  hero_image_id: null,
};

describe('PostDomain', () => {
  const factory = new PostFactory(ctx);

  const createPost = (data: Partial<PostData> = {}): PostDomain => {
    const result = factory.createDomain({ ...VALID_DATA, ...data });
    if (result.isFailure) {
      throw result.error;
    }
    const post = result.value;
    post.toEvents();
    return post;
  };

  const createPublishedPost = (): PostDomain => {
    const post = createPost();
    post.publishPost();
    post.toEvents();
    return post;
  };

  const createArchivedPost = (): PostDomain => {
    const post = createPublishedPost();
    post.archivePost();
    post.toEvents();
    return post;
  };

  describe('createDomain', () => {
    it('creates a draft with slug, reading time and CreatePostEvent', () => {
      const result = factory.createDomain(VALID_DATA);

      expect(result.isSuccess).toBe(true);
      expect(result.value.toAnemic()).toMatchObject({
        slug: 'warhammer-40k',
        status: PostStatus.DRAFT,
        reading_time: 1,
        published_at: null,
      });
      expect(result.value.toEvents().map((e) => e.event_name)).toEqual([
        'create',
      ]);
    });

    it('calculates the reading time from the content', () => {
      const content = Array(450).fill('wort').join(' ');

      const post = createPost({ content });

      expect(post.toAnemic().reading_time).toBe(3);
    });

    it('trims title and excerpt', () => {
      const anemic = createPost({
        title: '  Warhammer  ',
        excerpt: '  Kurz  ',
      }).toAnemic();

      expect(anemic.title).toBe('Warhammer');
      expect(anemic.excerpt).toBe('Kurz');
    });

    it('allows posts without images', () => {
      const anemic = createPost().toAnemic();

      expect(anemic.blog_image_id).toBeNull();
      expect(anemic.hero_image_id).toBeNull();
    });

    it.each([
      ['empty title', { title: '   ' }],
      ['title too long', { title: 'a'.repeat(256) }],
      ['excerpt too long', { excerpt: 'a'.repeat(501) }],
    ])('fails on %s', (_, data) => {
      const result = factory.createDomain({ ...VALID_DATA, ...data });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('updatePost', () => {
    it('updates the title but keeps the slug', () => {
      const post = createPost();

      const result = post.updatePost({ title: 'Warhammer 40.000' });

      expect(result.isSuccess).toBe(true);
      expect(post.toAnemic()).toMatchObject({
        title: 'Warhammer 40.000',
        slug: 'warhammer-40k',
        updated_at: NOW,
      });
      expect(post.toEvents().map((e) => e.event_name)).toEqual(['update']);
    });

    it('recalculates the reading time when the content changes', () => {
      const post = createPost();

      post.updatePost({ content: Array(401).fill('wort').join(' ') });

      expect(post.toAnemic().reading_time).toBe(3);
    });

    it('leaves fields untouched that are not passed', () => {
      const post = createPost({ excerpt: 'Kurz', featured: true });

      post.updatePost({ title: 'Neu' });

      expect(post.toAnemic()).toMatchObject({
        excerpt: 'Kurz',
        featured: true,
        category_ids: [CATEGORY_ID],
      });
    });

    it('clears a field with null', () => {
      const post = createPost({ excerpt: 'Kurz', hero_image_id: MEDIA_ID });

      post.updatePost({ excerpt: null, hero_image_id: null });

      expect(post.toAnemic().excerpt).toBeNull();
      expect(post.toAnemic().hero_image_id).toBeNull();
    });

    it('sets images', () => {
      const post = createPost();

      post.updatePost({ blog_image_id: MEDIA_ID, hero_image_id: MEDIA_ID });

      expect(post.toAnemic()).toMatchObject({
        blog_image_id: MEDIA_ID,
        hero_image_id: MEDIA_ID,
      });
    });

    it('raises no event when nothing changes', () => {
      const post = createPost();

      post.updatePost({
        title: VALID_DATA.title,
        category_ids: [CATEGORY_ID],
      });

      expect(post.toEvents()).toHaveLength(0);
    });

    it('allows updating published and archived posts', () => {
      const published = createPublishedPost();
      const archived = createArchivedPost();

      expect(published.updatePost({ title: 'Neu' }).isSuccess).toBe(true);
      expect(archived.updatePost({ title: 'Neu' }).isSuccess).toBe(true);
    });

    it('fails on an empty title', () => {
      const post = createPost();

      const result = post.updatePost({ title: '   ' });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });

    it('refuses to update a deleted post', () => {
      const post = createPost();
      post.deletePost();

      const result = post.updatePost({ title: 'Neu' });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });

    it('does not share the category array with the caller', () => {
      const categories: Array<CategoryId> = [CATEGORY_ID];
      const post = createPost();
      post.updatePost({ category_ids: categories });

      categories.push('category-2' as CategoryId);

      expect(post.toAnemic().category_ids).toEqual([CATEGORY_ID]);
    });
  });

  describe('publishPost', () => {
    it('publishes a draft with the current date', () => {
      const post = createPost();

      const result = post.publishPost();

      expect(result.isSuccess).toBe(true);
      expect(post.toAnemic()).toMatchObject({
        status: PostStatus.PUBLISHED,
        published_at: NOW,
      });
      expect(post.toEvents().map((e) => e.event_name)).toEqual(['publish']);
    });

    it('publishes backdated', () => {
      const post = createPost();

      post.publishPost(PAST);

      expect(post.toAnemic().published_at).toEqual(PAST);
    });

    it('publishes without images', () => {
      const post = createPost();

      expect(post.publishPost().isSuccess).toBe(true);
    });

    it('refuses a date in the future', () => {
      const post = createPost();

      const result = post.publishPost(FUTURE);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
      expect(post.toAnemic().status).toBe(PostStatus.DRAFT);
    });

    it('refuses empty content', () => {
      const post = createPost({ content: '   ' });

      const result = post.publishPost();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });

    it('refuses an already published post', () => {
      const post = createPublishedPost();

      const result = post.publishPost();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });

    it('refuses an archived post', () => {
      const post = createArchivedPost();

      const result = post.publishPost();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });

    it('refuses a deleted post', () => {
      const post = createPost();
      post.deletePost();

      const result = post.publishPost();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('archivePost / unarchivePost', () => {
    it('archives a published post', () => {
      const post = createPublishedPost();

      const result = post.archivePost();

      expect(result.isSuccess).toBe(true);
      expect(post.toAnemic().status).toBe(PostStatus.ARCHIVED);
      expect(post.toEvents().map((e) => e.event_name)).toEqual(['archive']);
    });

    it('refuses to archive a draft', () => {
      const post = createPost();

      const result = post.archivePost();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });

    it('unarchives and keeps the original published date', () => {
      const post = createPost();
      post.publishPost(PAST);
      post.archivePost();
      post.toEvents();

      const result = post.unarchivePost();

      expect(result.isSuccess).toBe(true);
      expect(post.toAnemic()).toMatchObject({
        status: PostStatus.PUBLISHED,
        published_at: PAST,
      });
      expect(post.toEvents().map((e) => e.event_name)).toEqual(['unarchive']);
    });

    it('refuses to unarchive a post that is not archived', () => {
      const post = createPublishedPost();

      const result = post.unarchivePost();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });

    it('refuses to archive a deleted post', () => {
      const post = createPublishedPost();
      post.deletePost();

      const result = post.archivePost();

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('deletePost / restorePost', () => {
    it('soft-deletes and restores the post', () => {
      const post = createPost();

      post.deletePost();
      expect(post.toAnemic().deleted_at).toEqual(NOW);

      post.restorePost();
      expect(post.toAnemic().deleted_at).toBeNull();

      expect(post.toEvents().map((e) => e.event_name)).toEqual([
        'delete',
        'restore',
      ]);
    });

    it('keeps the status through delete and restore', () => {
      const post = createArchivedPost();

      post.deletePost();
      post.restorePost();

      expect(post.toAnemic().status).toBe(PostStatus.ARCHIVED);
    });
  });
});
