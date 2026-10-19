import type { DomainContext } from '@toxictoast/shared-kernel';
import { CategoryFactory } from '../factories/index.js';
import type { CategoryDomain } from './category.domain.js';
import type { CategoryId } from '../types/index.js';

const ctx: DomainContext = {
  id: { generate: () => 'id-1' as never },
  date: { now: () => new Date('2026-10-19T12:00:00Z') },
};
const NOW = new Date('2026-10-19T12:00:00Z');
const PARENT_ID = 'parent-1' as CategoryId;

describe('CategoryDomain', () => {
  const factory = new CategoryFactory(ctx);

  const createCategory = (
    title = 'Warhammer',
    description: string | null = null,
  ): CategoryDomain => {
    const result = factory.createDomain({
      title,
      description,
      parent_id: null,
    });
    if (result.isFailure) {
      throw result.error;
    }
    const category = result.value;
    category.toEvents();
    return category;
  };

  describe('createDomain', () => {
    it('creates a category with slug and CreateCategoryEvent', () => {
      const result = factory.createDomain({
        title: 'Warhammer 40k',
        description: null,
        parent_id: null,
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.toAnemic().slug).toBe('warhammer-40k');
      expect(result.value.toEvents().map((e) => e.event_name)).toEqual([
        'create',
      ]);
    });

    it('trims title and description', () => {
      const anemic = createCategory(
        '  Warhammer  ',
        '  Alles zu 40k  ',
      ).toAnemic();

      expect(anemic.title).toBe('Warhammer');
      expect(anemic.description).toBe('Alles zu 40k');
    });

    it('turns an empty description into null', () => {
      const anemic = createCategory('Warhammer', '   ').toAnemic();

      expect(anemic.description).toBeNull();
    });

    it('accepts a parent on creation', () => {
      const result = factory.createDomain({
        title: 'Space Marines',
        description: null,
        parent_id: PARENT_ID,
      });

      expect(result.value.toAnemic().parent_id).toBe(PARENT_ID);
    });

    it('fails on an empty title', () => {
      const result = factory.createDomain({
        title: '   ',
        description: null,
        parent_id: null,
      });

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('updateCategory', () => {
    it('updates title and description but keeps the slug', () => {
      const category = createCategory('Warhammer');

      const result = category.updateCategory('Warhammer 40.000', 'Grimdark');

      expect(result.isSuccess).toBe(true);
      expect(category.toAnemic()).toMatchObject({
        title: 'Warhammer 40.000',
        description: 'Grimdark',
        slug: 'warhammer',
        updated_at: NOW,
      });
      expect(category.toEvents().map((e) => e.event_name)).toEqual(['update']);
    });

    it('raises no event when nothing changes', () => {
      const category = createCategory('Warhammer', 'Grimdark');

      category.updateCategory('Warhammer', 'Grimdark');

      expect(category.toEvents()).toHaveLength(0);
    });

    it('fails on an empty title', () => {
      const category = createCategory();

      const result = category.updateCategory('   ', null);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });

    it('refuses to update a deleted category', () => {
      const category = createCategory();
      category.deleteCategory();

      const result = category.updateCategory('Neu', null);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('changeParent', () => {
    it('sets a new parent', () => {
      const category = createCategory();

      const result = category.changeParent(PARENT_ID);

      expect(result.isSuccess).toBe(true);
      expect(category.toAnemic().parent_id).toBe(PARENT_ID);
      expect(category.toEvents().map((e) => e.event_name)).toEqual(['update']);
    });

    it('removes the parent', () => {
      const category = createCategory();
      category.changeParent(PARENT_ID);
      category.toEvents();

      category.changeParent(null);

      expect(category.toAnemic().parent_id).toBeNull();
      expect(category.toEvents()).toHaveLength(1);
    });

    it('refuses itself as parent', () => {
      const category = createCategory();

      const result = category.changeParent(category.toAnemic().id);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });

    it('raises no event when the parent is unchanged', () => {
      const category = createCategory();

      category.changeParent(null);

      expect(category.toEvents()).toHaveLength(0);
    });

    it('refuses to change the parent of a deleted category', () => {
      const category = createCategory();
      category.deleteCategory();

      const result = category.changeParent(PARENT_ID);

      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('deleteCategory / restoreCategory', () => {
    it('soft-deletes and restores the category', () => {
      const category = createCategory();

      category.deleteCategory();
      expect(category.toAnemic().deleted_at).toEqual(NOW);

      category.restoreCategory();
      expect(category.toAnemic().deleted_at).toBeNull();

      expect(category.toEvents().map((e) => e.event_name)).toEqual([
        'delete',
        'restore',
      ]);
    });

    it('ignores a second delete and a restore without delete', () => {
      const category = createCategory();

      category.restoreCategory();
      category.deleteCategory();
      category.deleteCategory();

      expect(category.toEvents()).toHaveLength(1);
    });
  });
});
