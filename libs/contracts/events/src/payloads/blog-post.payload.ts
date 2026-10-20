export interface BlogPostPayloadV1 {
  readonly id: string;
  readonly author_id: string;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string | null;
  readonly content: string;
  readonly status: 'draft' | 'published' | 'archived';
  readonly featured: boolean;
  readonly reading_time: number;
  readonly category_ids: ReadonlyArray<string>;
  readonly tag_ids: ReadonlyArray<string>;
  readonly blog_image_id: string | null;
  readonly hero_image_id: string | null;
  readonly published_at: string | null;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
}
