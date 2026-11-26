import type { AccountMetrics } from '@toxictoast/publisher-domain';
import type { SnapshotRowBase } from './snapshot-row-base.interface.js';

export interface AccountSnapshotRow extends SnapshotRowBase, AccountMetrics {}
