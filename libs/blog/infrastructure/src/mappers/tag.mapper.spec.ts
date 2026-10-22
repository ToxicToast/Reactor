import type { TagAnemic, TagId } from '@toxictoast/blog-domain';
import { TagMapper } from './tag.mapper.js';

const ANEMIC: TagAnemic = {
  id: '0192f3a0-0000-7000-8000-000000000001' as TagId,
  title: 'Warhammer',
  slug: 'warhammer',
  created_at: new Date('2026-10-20T10:00:00Z'),
  updated_at: null,
  deleted_at: null,
};

describe('TagMapper', () => {
  const mapper = new TagMapper();

  it('maps to a row and back without losing data', () => {
    expect(mapper.toAnemic(mapper.toRow(ANEMIC))).toEqual(ANEMIC);
  });
});
