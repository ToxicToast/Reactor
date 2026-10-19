import type { CommentAnemic } from '../anemics/index.js';

export type CommentData = Pick<
  CommentAnemic,
  'post_id' | 'parent_id' | 'author_id' | 'content'
>;
