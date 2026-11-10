import type { Nullable } from '@toxictoast/shared-types';
import type { PostReferences } from '../data/index.js';
import type {
  CategoryRepository,
  MediaRepository,
  TagRepository,
} from '../repositories/index.js';
import type { CategoryId, MediaId, TagId } from '../types/index.js';
import { PostReferencesService } from './post-references.service.js';

const NOW = new Date('2026-11-06T12:00:00Z');

interface StoredItem {
  readonly id: string;
  readonly deleted_at: Nullable<Date>;
}

const finder = <TRepository>(items: ReadonlyArray<StoredItem>): TRepository => {
  return {
    findByIds: async (ids: ReadonlyArray<string>) => {
      return items.filter((item) => {
        return ids.includes(item.id) && item.deleted_at === null;
      });
    },
  } as unknown as TRepository;
};

describe('PostReferencesService', () => {
  const service = new PostReferencesService(
    finder<CategoryRepository>([
      { id: 'cat-1', deleted_at: null },
      { id: 'cat-gone', deleted_at: NOW },
    ]),
    finder<TagRepository>([{ id: 'tag-1', deleted_at: null }]),
    finder<MediaRepository>([{ id: 'media-1', deleted_at: null }]),
  );

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

  it.each<[string, PostReferences]>([
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

  it('names all missing ids of one kind', async () => {
    const result = await service.validate({
      tag_ids: ['a' as TagId, 'tag-1' as TagId, 'b' as TagId],
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('a, b');
  });
});
