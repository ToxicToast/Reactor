import type { CategoryAnemic, CategoryId } from '@toxictoast/blog-domain';
import { CategoryMapper } from './category.mapper.js';

const ANEMIC: CategoryAnemic = {
  id: '0192f3a0-0000-7000-8000-000000000001' as CategoryId,
  title: 'Warhammer',
  slug: 'warhammer',
  description: 'Warhammer',
  parent_id: null,
  created_at: new Date('2026-10-20T10:00:00Z'),
  updated_at: null,
  deleted_at: null,
};

describe('CategoryMapper', () => {
  const mapper = new CategoryMapper();

  it('maps to a row and back without losing data', () => {
    expect(mapper.toAnemic(mapper.toRow(ANEMIC))).toEqual(ANEMIC);
  });
});
