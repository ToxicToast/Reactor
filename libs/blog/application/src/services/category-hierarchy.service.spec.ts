import type { CategoryId } from '@toxictoast/blog-domain';
import {
  categoryAnemic,
  InMemoryCategoryRepository,
  TEST_NOW,
} from '../testing/index.js';
import { CategoryHierarchyService } from './category-hierarchy.service.js';

const id = (value: string): CategoryId => value as CategoryId;

describe('CategoryHierarchyService', () => {
  let repository: InMemoryCategoryRepository;
  let service: CategoryHierarchyService;

  beforeEach(async () => {
    repository = new InMemoryCategoryRepository();
    service = new CategoryHierarchyService(repository);

    // root → child → grandchild
    await repository.save(categoryAnemic('root'));
    await repository.save(categoryAnemic('child', { parent_id: id('root') }));
    await repository.save(
      categoryAnemic('grandchild', { parent_id: id('child') }),
    );
  });

  it('accepts no parent', async () => {
    const result = await service.validateParent(null, id('child'));

    expect(result.isSuccess).toBe(true);
  });

  it('accepts an existing parent for a new category', async () => {
    const result = await service.validateParent(id('root'));

    expect(result.isSuccess).toBe(true);
  });

  it('fails when the parent does not exist', async () => {
    const result = await service.validateParent(id('missing'));

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('fails when the parent is deleted', async () => {
    await repository.save(categoryAnemic('deleted', { deleted_at: TEST_NOW }));

    const result = await service.validateParent(id('deleted'));

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('accepts moving a category below an unrelated branch', async () => {
    await repository.save(categoryAnemic('other'));

    const result = await service.validateParent(id('other'), id('child'));

    expect(result.isSuccess).toBe(true);
  });

  it('refuses moving a category below its own child', async () => {
    const result = await service.validateParent(id('child'), id('root'));

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('refuses moving a category below its grandchild', async () => {
    const result = await service.validateParent(id('grandchild'), id('root'));

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });

  it('stops on a corrupted cycle in the data', async () => {
    await repository.save(categoryAnemic('a', { parent_id: id('b') }));
    await repository.save(categoryAnemic('b', { parent_id: id('a') }));
    const shallow = new CategoryHierarchyService(repository, 5);

    const result = await shallow.validateParent(id('a'), id('root'));

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('CONFLICT');
  });
});
