import type { ModerationResult } from '../data/index.js';

export interface DecisionPublisher {
  publish(result: ModerationResult): Promise<void>;
}
