export interface SyncYouTubeAccountOutput {
  readonly observed: number;
}

export interface SyncYouTubePostsOutput {
  readonly observed: number;
}

export interface SyncYouTubePostMetricsInput {
  readonly remote_ids: ReadonlyArray<string>;
}

export interface SyncYouTubePostMetricsOutput {
  readonly observed: number;
  readonly failed: number;
}
