export interface BlogCategoryPayloadV1 {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly description: string | null;
  readonly parent_id: string | null;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
}
