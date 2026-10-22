import type { Anemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { PostStatus } from '../enums/index.js';
import type {
  AuthorId,
  CategoryId,
  MediaId,
  PostId,
  TagId,
} from '../types/index.js';

export interface PostAnemic extends Anemic<PostId> {
  readonly author_id: AuthorId;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: Nullable<string>;
  readonly content: string;
  readonly status: PostStatus;
  readonly featured: boolean;
  readonly reading_time: number;
  readonly category_ids: ReadonlyArray<CategoryId>;
  readonly tag_ids: ReadonlyArray<TagId>;
  readonly blog_image_id: Nullable<MediaId>;
  readonly hero_image_id: Nullable<MediaId>;
  readonly published_at: Nullable<Date>;
}
