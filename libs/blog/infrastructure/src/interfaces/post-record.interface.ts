import type { PostCategoryRow } from './post-category-row.interface.js';
import type { PostRow } from './post-row.interface.js';
import type { PostTagRow } from './post-tag-row.interface.js';

export interface PostRecord {
  post: PostRow;
  categories: Array<PostCategoryRow>;
  tags: Array<PostTagRow>;
}
