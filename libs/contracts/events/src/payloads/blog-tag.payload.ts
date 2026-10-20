export interface BlogTagPayloadV1 {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
}
