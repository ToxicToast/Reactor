export interface FailedAttemptCounter {
  increment(ip: string, windowSeconds: number): Promise<number>;
  reset(ip: string): Promise<void>;
}
