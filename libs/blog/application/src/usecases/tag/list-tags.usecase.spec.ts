import type { TagAnemic, TagId } from '@toxictoast/blog-domain';
import { InMemoryTagRepository } from '../../testing/index.js';
import { ListTagsUseCase } from './list-tags.usecase.js';

const NOW = new Date('2026-10-19T12:00:00Z');

const tagAnemic = (id: string, deletedAt: Date | null = null): TagAnemic => {
  return {
    id: id as TagId,
    title: id,
    slug: id,
    created_at: NOW,
    updated_at: null,
    deleted_at: deletedAt,
  };
};

describe('ListTagsUseCase', () => {
  let repository: InMemoryTagRepository;
  let useCase: ListTagsUseCase;

  beforeEach(async () => {
    repository = new InMemoryTagRepository();
    useCase = new ListTagsUseCase(repository);

    await repository.save(tagAnemic('tag-1'));
    await repository.save(tagAnemic('tag-2'));
    await repository.save(tagAnemic('tag-3'));
    await repository.save(tagAnemic('tag-4', NOW));
  });

  const ids = (tags: Array<TagAnemic>): Array<string> => {
    return tags.map((tag) => tag.id);
  };

  it('returns all tags without deleted ones', async () => {
    const result = await useCase.execute({});

    expect(result.isSuccess).toBe(true);
    expect(ids(result.value)).toEqual(['tag-1', 'tag-2', 'tag-3']);
  });

  it('includes deleted tags with withDeleted', async () => {
    const result = await useCase.execute({ withDeleted: true });

    expect(ids(result.value)).toEqual(['tag-1', 'tag-2', 'tag-3', 'tag-4']);
  });

  it('applies limit and offset', async () => {
    const result = await useCase.execute({ limit: 2, offset: 1 });

    expect(ids(result.value)).toEqual(['tag-2', 'tag-3']);
  });

  it('returns an empty list when nothing matches', async () => {
    const result = await useCase.execute({ offset: 10 });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual([]);
  });
});
