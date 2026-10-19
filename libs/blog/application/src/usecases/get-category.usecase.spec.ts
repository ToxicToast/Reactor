import type { CategoryId } from '@toxictoast/blog-domain';
import {
  categoryAnemic,
  InMemoryCategoryRepository,
  TEST_NOW,
} from '../testing/index.js';
import { GetCategoryUseCase } from './get-category.usecase.js';

const ID = 'cat-1' as CategoryId;

describe('GetCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: GetCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('returns the category', async () => {
    await repository.save(categoryAnemic('cat-1'));

    const result = await useCase.execute({ id: ID });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(categoryAnemic('cat-1'));
  });

  it('fails when the category does not exist', async () => {
    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('hides a deleted category by default', async () => {
    await repository.save(categoryAnemic('cat-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns a deleted category with withDeleted', async () => {
    await repository.save(categoryAnemic('cat-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: ID, withDeleted: true });

    expect(result.isSuccess).toBe(true);
  });
});
