import type { PostMetrics } from '../types/index.js';
import type { PostRef } from './post-ref.interface.js';

export interface PostSnapshot {
  readonly post: PostRef;
  readonly observed_at: Date;
  readonly metrics: PostMetrics;
}
