import type { PostAnemic } from '../anemics/index.js';
import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { CategoryId, MediaId, TagId } from '../types/index.js';
import { PostStatus } from '../enums/index.js';

export type PostData = Pick<
  PostAnemic,
  | 'author_id'
  | 'title'
  | 'excerpt'
  | 'content'
  | 'featured'
  | 'category_ids'
  | 'tag_ids'
  | 'blog_image_id'
  | 'hero_image_id'
>;

export interface UpdatePostData {
  readonly title?: Optional<string>;
  readonly excerpt?: Optional<Nullable<string>>;
  readonly content?: Optional<string>;
  readonly featured?: Optional<boolean>;
  readonly category_ids?: Optional<ReadonlyArray<CategoryId>>;
  readonly tag_ids?: Optional<ReadonlyArray<TagId>>;
  readonly blog_image_id?: Optional<Nullable<MediaId>>;
  readonly hero_image_id?: Optional<Nullable<MediaId>>;
}

export interface PostFilter {
  readonly status?: Optional<PostStatus>;
  readonly category_id?: Optional<CategoryId>;
  readonly tag_id?: Optional<TagId>;
}
