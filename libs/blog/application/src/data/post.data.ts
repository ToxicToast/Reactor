import type { Nullable, Optional } from '@toxictoast/shared-kernel';
import type {
  CategoryId,
  MediaId,
  PostId,
  PostStatus,
  TagId,
  UpdatePostData,
} from '@toxictoast/blog-domain';

export interface PostReferences {
  readonly category_ids?: Optional<ReadonlyArray<CategoryId>>;
  readonly tag_ids?: Optional<ReadonlyArray<TagId>>;
  readonly blog_image_id?: Optional<Nullable<MediaId>>;
  readonly hero_image_id?: Optional<Nullable<MediaId>>;
}

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
}
