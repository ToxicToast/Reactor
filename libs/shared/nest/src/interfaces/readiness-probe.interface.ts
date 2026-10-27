import type { ReadinessResult } from './readiness-result.interface.js';

export interface ReadinessProbe {
  readonly key: string;
  probe(): Promise<ReadinessResult>;
}
