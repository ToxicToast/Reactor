export interface OutboxRelayWorkerOptions {
  readonly intervalMs: number;
  readonly onError: (error: unknown) => void;
}
