export interface OutboxRelayResult {
  readonly published: number;
  readonly failed: number;
  readonly error: unknown;
}
