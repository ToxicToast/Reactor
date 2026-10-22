import type { CategoryId, MediaId, TagId } from '@toxictoast/blog-domain';
import {
  categoryAnemic,
  InMemoryCategoryRepository,
  InMemoryMediaRepository,
  InMemoryTagRepository,
  mediaAnemic,
  TEST_NOW,
} from '../testing/index.js';
import { PostReferencesService } from './post-references.service.js';

describe('PostReferencesService', () => {
  let categories: InMemoryCategoryRepository;
  let tags: InMemoryTagRepository;
  let media: InMemoryMediaRepository;
  let service: PostReferencesService;

  beforeEach(async () => {
    categories = new InMemoryCategoryRepository();
    tags = new InMemoryTagRepository();
    media = new InMemoryMediaRepository();
    service = new PostReferencesService(categories, tags, media);

    await categories.save(categoryAnemic('cat-1'));
    await categories.save(categoryAnemic('cat-gone', { deleted_at: TEST_NOW }));
    await tags.save({
      id: 'tag-1' as TagId,
      title: 'tag-1',
      slug: 'tag-1',
      created_at: TEST_NOW,
      updated_at: null,
      deleted_at: null,
    });
    await media.save(mediaAnemic('media-1'));
  });

  it('accepts existing references', async () => {
    const result = await service.validate({
      category_ids: ['cat-1' as CategoryId],
      tag_ids: ['tag-1' as TagId],
      blog_image_id: 'media-1' as MediaId,
      hero_image_id: 'media-1' as MediaId,
    });

    expect(result.isSuccess).toBe(true);
  });

  it('accepts no references at all', async () => {
    const result = await service.validate({});

    expect(result.isSuccess).toBe(true);
  });

  it('accepts null images', async () => {
    const result = await service.validate({
      blog_image_id: null,
      hero_image_id: null,
    });

    expect(result.isSuccess).toBe(true);
  });

  it('ignores duplicate ids', async () => {
    const result = await service.validate({
      category_ids: ['cat-1' as CategoryId, 'cat-1' as CategoryId],
    });

    expect(result.isSuccess).toBe(true);
  });

  it.each([
    ['missing category', { category_ids: ['missing' as CategoryId] }],
    ['deleted category', { category_ids: ['cat-gone' as CategoryId] }],
    ['missing tag', { tag_ids: ['missing' as TagId] }],
    ['missing blog image', { blog_image_id: 'missing' as MediaId }],
    ['missing hero image', { hero_image_id: 'missing' as MediaId }],
  ])('fails on %s', async (_, references) => {
    const result = await service.validate(references);

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
