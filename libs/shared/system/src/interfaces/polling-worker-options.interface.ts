export interface PollingWorkerOptions {
  readonly intervalMs: number;
  readonly onError: (error: unknown) => void;
}
