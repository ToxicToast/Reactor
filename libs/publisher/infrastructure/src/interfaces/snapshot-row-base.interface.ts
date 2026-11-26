import type { PostRef } from '@toxictoast/publisher-domain';

export interface SnapshotRowBase extends PostRef {
  readonly observed_at: Date;
}
