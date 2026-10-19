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
import { UpdateCategoryUseCase } from './update-category.usecase.js';

const ID = 'cat-1' as CategoryId;

describe('UpdateCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: UpdateCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new UpdateCategoryUseCase(
      new CategoryFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  it('updates title and description, keeps the slug', async () => {
    await repository.save(categoryAnemic('cat-1'));

    const result = await useCase.execute({
      id: ID,
      title: 'Warhammer 40k',
      description: 'Grimdark',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      title: 'Warhammer 40k',
      description: 'Grimdark',
      slug: 'cat-1',
    });
    expect(outbox.events.map((e) => e.event_name)).toEqual(['update']);
  });

  it('does not write when nothing changes', async () => {
    await repository.save(categoryAnemic('cat-1'));

    const result = await useCase.execute({
      id: ID,
      title: 'cat-1',
      description: null,
    });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('treats a deleted category as not found', async () => {
    await repository.save(categoryAnemic('cat-1', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({
      id: ID,
      title: 'Neu',
      description: null,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('passes validation errors through', async () => {
    await repository.save(categoryAnemic('cat-1'));

    const result = await useCase.execute({
      id: ID,
      title: '   ',
      description: null,
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('VALIDATION');
  });
});
