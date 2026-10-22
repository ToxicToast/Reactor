import { MediaAnemic, MediaId, MediaStatus } from '@toxictoast/blog-domain';
import { MediaMapper } from './media.mapper.js';

const ANEMIC: MediaAnemic = {
  id: '0192f3a0-0000-7000-8000-000000000001' as MediaId,
  object_key: 'warhammer-123',
  filename: 'warhammer-screenshot.png',
  mime_type: 'image/png',
  size: 123,
  alt_text: null,
  status: MediaStatus.READY,
  created_at: new Date('2026-10-20T10:00:00Z'),
  updated_at: null,
  deleted_at: null,
};

describe('MediaMapper', () => {
  const mapper = new MediaMapper();

  it('maps to a row and back without losing data', () => {
    expect(mapper.toAnemic(mapper.toRow(ANEMIC))).toEqual(ANEMIC);
  });
});
