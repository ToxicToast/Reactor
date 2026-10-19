import {
  DomainPersistence,
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application';
import { CategoryFactory, type CategoryId } from '@toxictoast/blog-domain';
import { CategoryHierarchyService } from '../services/index.js';
import {
  categoryAnemic,
  createTestContext,
  InMemoryCategoryRepository,
  TEST_NOW,
} from '../testing/index.js';
import { ChangeCategoryParentUseCase } from './change-category-parent.usecase.js';

const id = (value: string): CategoryId => value as CategoryId;

describe('ChangeCategoryParentUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: ChangeCategoryParentUseCase;

  beforeEach(async () => {
    repository = new InMemoryCategoryRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new ChangeCategoryParentUseCase(
      new CategoryFactory(createTestContext()),
      repository,
      new CategoryHierarchyService(repository),
      new DomainPersistence(outbox, uow),
    );

    // root → child, other
    await repository.save(categoryAnemic('root'));
    await repository.save(categoryAnemic('child', { parent_id: id('root') }));
    await repository.save(categoryAnemic('other'));
  });

  it('moves a category below another one', async () => {
    const result = await useCase.execute({
      id: id('child'),
      parent_id: id('other'),
    });

    expect(result.isSuccess).toBe(true);
    expect(repository.items.get(id('child'))?.parent_id).toBe('other');
    expect(outbox.events.map((e) => e.event_name)).toEqual(['update']);
  });

  it('moves a category to the root', async () => {
    const result = await useCase.execute({ id: id('child'), parent_id: null });

    expect(result.isSuccess).toBe(true);
    expect(repository.items.get(id('child'))?.parent_id).toBeNull();
  });

  it('does not write when the parent is unchanged', async () => {
    const result = await useCase.execute({
      id: id('child'),
      parent_id: id('root'),
    });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('refuses the category itself as parent', async () => {
    const result = await useCase.execute({
      id: id('root'),
      parent_id: id('root'),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });

  it('refuses moving a category below its own child', async () => {
    const result = await useCase.execute({
      id: id('root'),
      parent_id: id('child'),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
    expect(repository.items.get(id('root'))?.parent_id).toBeNull();
  });

  it('refuses a deleted parent', async () => {
    await repository.save(categoryAnemic('gone', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({
      id: id('child'),
      parent_id: id('gone'),
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('fails when the category does not exist', async () => {
    const result = await useCase.execute({
      id: id('missing'),
      parent_id: null,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
