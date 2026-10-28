import type { PollingResult } from './polling-result.interface.js';

export interface PollingTask {
  readonly batchSize: number;
  run(): Promise<PollingResult>;
}
