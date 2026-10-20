export interface BlogMediaPayloadV1 {
  readonly id: string;
  readonly object_key: string;
  readonly filename: string;
  readonly mime_type: string;
  readonly size: number;
  readonly alt_text: string | null;
  readonly status: 'pending' | 'ready';
  readonly created_at: string;
  readonly updated_at: string | null;
  readonly deleted_at: string | null;
}
