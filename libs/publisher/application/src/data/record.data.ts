import type {
  Account,
  AccountMetrics,
  Post,
  PostMetrics,
  PostRef,
} from '@toxictoast/publisher-domain';

export interface RecordAccountInput {
  readonly account: Account;
  readonly metrics: AccountMetrics;
  readonly observed_at: Date;
}

export interface RecordPostInput {
  readonly post: Post;
  readonly metrics: PostMetrics;
  readonly observed_at: Date;
}

export interface RecordPostFailureInput {
  readonly post: PostRef;
  readonly failed_at: Date;
  readonly error: string;
}

export interface RecordOutput {
  /** false, wenn sich keine Kennzahl geändert hat */
  readonly snapshot_recorded: boolean;
}
