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
import { CreateCategoryUseCase } from './create-category.usecase.js';

describe('CreateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: CreateCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new CreateCategoryUseCase(
      new CategoryFactory(createTestContext()),
      repository,
      new CategoryHierarchyService(repository),
      new DomainPersistence(outbox, uow),
    );
  });

  it('creates a root category and writes the event', async () => {
    const result = await useCase.execute({
      title: 'Warhammer',
      description: null,
      parent_id: null,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.slug).toBe('warhammer');
    expect(repository.items.size).toBe(1);
    expect(outbox.events.map((e) => e.event_name)).toEqual(['create']);
  });

  it('creates a category below an existing parent', async () => {
    await repository.save(categoryAnemic('root'));

    const result = await useCase.execute({
      title: 'Space Marines',
      description: null,
      parent_id: 'root' as CategoryId,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.parent_id).toBe('root');
  });

  it('fails when the parent does not exist', async () => {
    const result = await useCase.execute({
      title: 'Space Marines',
      description: null,
      parent_id: 'missing' as CategoryId,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
    expect(uow.runs).toBe(0);
  });

  it('fails when the slug already exists, even if deleted', async () => {
    await repository.save(
      categoryAnemic('warhammer', { deleted_at: TEST_NOW }),
    );

    const result = await useCase.execute({
      title: 'Warhammer',
      description: null,
      parent_id: null,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('fails on an invalid title', async () => {
    const result = await useCase.execute({
      title: '   ',
      description: null,
      parent_id: null,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
