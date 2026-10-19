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
} from '../../testing/index.js';
import { RestoreCategoryUseCase } from './restore-category.usecase.js';

const id = (value: string): CategoryId => value as CategoryId;

describe('RestoreCategoryUseCase', () => {
  let repository: InMemoryCategoryRepository;
  let outbox: InMemoryOutbox;
  let uow: ImmediateUnitOfWork;
  let useCase: RestoreCategoryUseCase;

  beforeEach(() => {
    repository = new InMemoryCategoryRepository();
    outbox = new InMemoryOutbox();
    uow = new ImmediateUnitOfWork();
    useCase = new RestoreCategoryUseCase(
      new CategoryFactory(createTestContext()),
      repository,
      new DomainPersistence(outbox, uow),
    );
  });

  it('restores a deleted root category', async () => {
    await repository.save(categoryAnemic('root', { deleted_at: TEST_NOW }));

    const result = await useCase.execute({ id: id('root') });

    expect(result.isSuccess).toBe(true);
    expect(repository.items.get(id('root'))?.deleted_at).toBeNull();
    expect(outbox.events.map((e) => e.event_name)).toEqual(['restore']);
  });

  it('restores a child when its parent exists', async () => {
    await repository.save(categoryAnemic('root'));
    await repository.save(
      categoryAnemic('child', { parent_id: id('root'), deleted_at: TEST_NOW }),
    );

    const result = await useCase.execute({ id: id('child') });

    expect(result.isSuccess).toBe(true);
  });

  it('refuses to restore a child below a deleted parent', async () => {
    await repository.save(categoryAnemic('root', { deleted_at: TEST_NOW }));
    await repository.save(
      categoryAnemic('child', { parent_id: id('root'), deleted_at: TEST_NOW }),
    );

    const result = await useCase.execute({ id: id('child') });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
    expect(repository.items.get(id('child'))?.deleted_at).toEqual(TEST_NOW);
  });

  it('succeeds without writing when not deleted', async () => {
    await repository.save(categoryAnemic('root'));

    const result = await useCase.execute({ id: id('root') });

    expect(result.isSuccess).toBe(true);
    expect(uow.runs).toBe(0);
  });

  it('fails when the category does not exist', async () => {
    const result = await useCase.execute({ id: id('missing') });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });
});
