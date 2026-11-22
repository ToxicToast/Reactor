import type { MediaId } from '@toxictoast/blog-domain';
import { PUBLIC_MEDIA } from '../constants/index.js';

export const publicMediaKey = (id: MediaId): string => {
  return `${PUBLIC_MEDIA.KEY_PREFIX}${id}`;
};
