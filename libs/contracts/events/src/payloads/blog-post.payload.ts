import type { Nullable } from '@toxictoast/shared-types';

export interface BlogPostPayloadV1 {
  readonly id: string;
  readonly author_id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: Nullable<string>;
  readonly content: string;
  readonly status: 'draft' | 'published' | 'archived';
  readonly featured: boolean;
  readonly reading_time: number;
  readonly category_ids: ReadonlyArray<string>;
  readonly tag_ids: ReadonlyArray<string>;
  readonly blog_image_id: Nullable<string>;
  readonly hero_image_id: Nullable<string>;
  readonly published_at: Nullable<string>;
  readonly created_at: string;
  readonly updated_at: Nullable<string>;
  readonly deleted_at: Nullable<string>;
}
