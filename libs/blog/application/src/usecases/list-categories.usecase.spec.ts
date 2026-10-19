import type { CategoryAnemic } from '@toxictoast/blog-domain';
import {
  categoryAnemic,
  InMemoryCategoryRepository,
  TEST_NOW,
} from '../testing/index.js';
import { ListCategoriesUseCase } from './list-categories.usecase.js';

describe('ListCategoriesUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let useCase: ListCategoriesUseCase;

  beforeEach(async () => {
    repository = new InMemoryCategoryRepository();
    useCase = new ListCategoriesUseCase(repository);

    await repository.save(categoryAnemic('cat-1'));
    await repository.save(categoryAnemic('cat-2'));
    await repository.save(categoryAnemic('cat-3'));
    await repository.save(categoryAnemic('cat-4', { deleted_at: TEST_NOW }));
  });

  const ids = (categories: Array<CategoryAnemic>): Array<string> => {
    return categories.map((category) => category.id);
  };

  it('returns all categories without deleted ones', async () => {
    const result = await useCase.execute({});

    expect(ids(result.value)).toEqual(['cat-1', 'cat-2', 'cat-3']);
  });

  it('includes deleted categories with withDeleted', async () => {
    const result = await useCase.execute({ withDeleted: true });

    expect(ids(result.value)).toEqual(['cat-1', 'cat-2', 'cat-3', 'cat-4']);
  });

  it('applies limit and offset', async () => {
    const result = await useCase.execute({ limit: 2, offset: 1 });

    expect(ids(result.value)).toEqual(['cat-2', 'cat-3']);
  });
});
