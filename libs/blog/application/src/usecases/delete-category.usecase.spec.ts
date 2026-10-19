import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { CategoryFactory, type CategoryId } from '@toxictoast/blog-domain';
import {
  categoryAnemic,
  createTestContext,
  InMemoryCategoryRepository,
  TEST_NOW,
} from '../testing/index.js';
import { DeleteCategoryUseCase } from './delete-category.usecase.js';

const id = (value: string): CategoryId => value as CategoryId;

describe('DeleteCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: DeleteCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new DeleteCategoryUseCase(
      new CategoryFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  it('deletes a category without children', async () => {
    await repository.save(categoryAnemic('leaf'));

    const result = await useCase.execute({ id: id('leaf') });

    expect(result.isSuccess).toBe(true);
    expect(repository.items.get(id('leaf'))?.deleted_at).toEqual(TEST_NOW);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['delete']);
  });

  it('refuses to delete a category with children', async () => {
    await repository.save(categoryAnemic('root'));
    await repository.save(categoryAnemic('child', { parent_id: id('root') }));

    const result = await useCase.execute({ id: id('root') });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
    expect(repository.items.get(id('root'))?.deleted_at).toBeNull();
    expect(uow.runs).toBe(0);
  });

  it('ignores deleted children', async () => {
    await repository.save(categoryAnemic('root'));
    await repository.save(
      categoryAnemic('child', { parent_id: id('root'), deleted_at: TEST_NOW }),
    );

    const result = await useCase.execute({ id: id('root') });

    expect(result.isSuccess).toBe(true);
  });

  it('succeeds without writing when already deleted', async () => {
    await repository.save(categoryAnemic('leaf', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: id('leaf') });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails when the category does not exist', async () => {
    const result = await useCase.execute({ id: id('missing') });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
