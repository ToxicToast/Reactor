import type { Optional } from '@toxictoast/shared-types';
import type { CategoryAnemic } from '../anemics/index.js';
import type { CategoryRepository } from '../repositories/index.js';
import type { CategoryId } from '../types/index.js';
import { CategoryHierarchyService } from './category-hierarchy.service.js';

const NOW = new Date('2026-11-06T12:00:00Z');

const id = (value: string): CategoryId => value as CategoryId;

const category = (
  value: string,
  overrides: Partial<CategoryAnemic> = {},
): CategoryAnemic => {
  return {
    id: id(value),
    title: value,
    slug: value,
    description: null,
    parent_id: null,
    created_at: NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};

describe('CategoryHierarchyService', () => {
  let items: Map<CategoryId, CategoryAnemic>;
  let service: CategoryHierarchyService;

  const add = (...categories: Array<CategoryAnemic>): void => {
    for (const item of categories) {
      items.set(item.id, item);
    }
  };

  const repository = (): CategoryRepository => {
    return {
      findById: async (
        categoryId: CategoryId,
        withDeleted?: Optional<boolean>,
      ) => {
        const found = items.get(categoryId) ?? null;
        if (found && !withDeleted && found.deleted_at !== null) {
          return null;
        }
        return found;
      },
      findChildren: async (parentId: CategoryId) => {
        return [...items.values()].filter((item) => {
          return item.parent_id === parentId && item.deleted_at === null;
        });
      },
    } as unknown as CategoryRepository;
  };

  beforeEach(() => {
    items = new Map();
    service = new CategoryHierarchyService(repository());

    // root → child → grandchild
    add(
      category('root'),
      category('child', { parent_id: id('root') }),
      category('grandchild', { parent_id: id('child') }),
    );
  });

  describe('validateParent', () => {
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
      add(category('deleted', { deleted_at: NOW }));

      const result = await service.validateParent(id('deleted'));

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('accepts moving a category below an unrelated branch', async () => {
      add(category('other'));

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
      add(
        category('a', { parent_id: id('b') }),
        category('b', { parent_id: id('a') }),
      );
      const shallow = new CategoryHierarchyService(repository(), 5);

      const result = await shallow.validateParent(id('a'), id('root'));

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('validateRestore', () => {
    it('accepts a root category', async () => {
      const result = await service.validateRestore(category('lonely'));

      expect(result.isSuccess).toBe(true);
    });

    it('accepts a category with an active parent', async () => {
      const result = await service.validateRestore(
        category('orphan', { parent_id: id('root') }),
      );

      expect(result.isSuccess).toBe(true);
    });

    it('refuses a category whose parent is deleted', async () => {
      add(category('gone', { deleted_at: NOW }));

      const result = await service.validateRestore(
        category('orphan', { parent_id: id('gone') }),
      );

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('validateDelete', () => {
    it('accepts a category without children', async () => {
      const result = await service.validateDelete(id('grandchild'));

      expect(result.isSuccess).toBe(true);
    });

    it('refuses a category with active children', async () => {
      const result = await service.validateDelete(id('root'));

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });

    it('ignores deleted children', async () => {
      add(category('grandchild', { parent_id: id('child'), deleted_at: NOW }));

      const result = await service.validateDelete(id('child'));

      expect(result.isSuccess).toBe(true);
    });
  });
});
