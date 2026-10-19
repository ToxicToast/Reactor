import {
  MediaStatus,
  type MediaAnemic,
  type MediaId,
} from '@toxictoast/blog-domain';
import { TEST_NOW } from './test-domain-context.js';

export const mediaAnemic = (
  id: string,
  overrides: Partial<MediaAnemic> = {},
): MediaAnemic => {
  return {
    id: id as MediaId,
    object_key: `media/${id}.png`,
    filename: `${id}.png`,
    mime_type: 'image/png',
    size: 1024,
    alt_text: null,
    status: MediaStatus.PENDING,
    created_at: TEST_NOW,
    updated_at: null,
    deleted_at: null,
    ...overrides,
  };
};
