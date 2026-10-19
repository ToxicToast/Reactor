import type { DomainContext } from '@toxictoast/shared-kernel';
import { TagFactory } from '../factories/index.js';
import type { TagDomain } from './tag.domain.js';

const ctx: DomainContext = {
  id: { generate: () => 'id-1' as never },
  date: { now: () => new Date('2026-10-19T12:00:00Z') },
};

describe('TagDomain', () => {
  const factory = new TagFactory(ctx);

  const createTag = (title: string): TagDomain => {
    const result = factory.createDomain({ title });
    if (result.isFailure) {
      throw result.error;
    }
    return result.value;
  };

  describe('createDomain', () => {
    it('creates a tag with slug and CreateTagEvent', () => {
      const result = factory.createDomain({ title: 'Warhammer 40k' });
      expect(result.isSuccess).toBe(true);
      expect(result.value.toAnemic().slug).toBe('warhammer-40k');
      expect(result.value.toEvents().map((e) => e.event_name)).toEqual([
        'create',
      ]);
    });

    it('trims the title', () => {
      const tag = createTag('  Warhammer  ');
      expect(tag.toAnemic().title).toBe('Warhammer');
    });

    it('fails on an empty title', () => {
      const result = factory.createDomain({ title: '   ' });
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('VALIDATION');
    });
  });

  describe('updateTitle', () => {
    it('keeps the slug when the title changes', () => {
      const tag = createTag('Warhammer');
      tag.toEvents();
      const result = tag.updateTitle('Warhammer 40.000');
      expect(result.isSuccess).toBe(true);
      expect(tag.toAnemic().slug).toBe('warhammer');
      expect(tag.toEvents().map((e) => e.event_name)).toEqual(['update']);
    });

    it('raises no event when the title is unchanged', () => {
      const tag = createTag('Warhammer');
      tag.toEvents();
      tag.updateTitle('Warhammer');
      expect(tag.toEvents()).toHaveLength(0);
    });

    it('refuses to update a deleted tag', () => {
      const tag = createTag('Warhammer');
      tag.deleteTag();
      const result = tag.updateTitle('Neu');
      expect(result.isFailure).toBe(true);
      expect(result.error.code).toBe('CONFLICT');
    });
  });

  describe('deleteTag / restoreTag', () => {
    it('soft-deletes and restores the tag', () => {
      const tag = createTag('Warhammer');
      tag.toEvents();
      tag.deleteTag();
      expect(tag.toAnemic().deleted_at).toEqual(
        new Date('2026-10-19T12:00:00Z'),
      );
      tag.restoreTag();
      expect(tag.toAnemic().deleted_at).toBeNull();
      expect(tag.toEvents().map((e) => e.event_name)).toEqual([
        'delete',
        'restore',
      ]);
    });

    it('ignores a second delete', () => {
      const tag = createTag('Warhammer');
      tag.toEvents();
      expect(tag.toEvents()).toHaveLength(0);
      tag.deleteTag();
      tag.deleteTag();
      expect(tag.toEvents()).toHaveLength(1);
    });
  });
});
