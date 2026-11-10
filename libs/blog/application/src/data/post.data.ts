import type { Optional } from '@toxictoast/shared-types';
import type {
  CategoryId,
  PostId,
  PostStatus,
  TagId,
  UpdatePostData,
} from '@toxictoast/blog-domain';

export interface UpdatePostInput extends UpdatePostData {
  readonly id: PostId;
}

export interface PublishPostInput {
  readonly id: PostId;
  readonly published_at?: Optional<Date>;
}

export interface PostIdInput {
  readonly id: PostId;
  readonly withDeleted?: Optional<boolean>;
  readonly publishedOnly?: Optional<boolean>;
}

export interface PostSlugInput {
  readonly slug: string;
}

export interface ListPostsInput {
  readonly status?: Optional<PostStatus>;
  readonly category_id?: Optional<CategoryId>;
  readonly tag_id?: Optional<TagId>;
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
  readonly publishedOnly?: Optional<boolean>;
}
