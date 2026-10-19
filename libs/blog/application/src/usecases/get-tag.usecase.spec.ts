import type { TagAnemic, TagId } from '@toxictoast/blog-domain';
import { InMemoryTagRepository } from '../testing/index.js';
import { GetTagUseCase } from './get-tag.usecase.js';

const NOW = new Date('2026-10-19T12:00:00Z');
const TAG_ID = 'tag-1' as TagId;

const tagAnemic = (overrides: Partial<TagAnemic> = {}): TagAnemic => {
  return {
    id: TAG_ID,
    title: 'Warhammer',
    slug: 'warhammer',
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('GetTagUseCase', () => {
  let repository: InMemoryTagRepository;
  let useCase: GetTagUseCase;

  beforeEach(() => {
    repository = new InMemoryTagRepository();
    useCase = new GetTagUseCase(repository);
  });

  it('returns the tag', async () => {
    await repository.save(tagAnemic());

    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(tagAnemic());
  });

  it('fails when the tag does not exist', async () => {
    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('hides a deleted tag by default', async () => {
    await repository.save(tagAnemic({ deleted_at: NOW }));

    const result = await useCase.execute({ id: TAG_ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns a deleted tag with withDeleted', async () => {
    await repository.save(tagAnemic({ deleted_at: NOW }));

    const result = await useCase.execute({ id: TAG_ID, withDeleted: true });

    expect(result.isSuccess).toBe(true);
    expect(result.value.deleted_at).toEqual(NOW);
  });
});
