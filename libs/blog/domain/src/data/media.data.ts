import type { MediaAnemic } from '../anemics/index.js';

export type MediaData = Pick<
  MediaAnemic,
  'filename' | 'mime_type' | 'size' | 'alt_text'
>;
