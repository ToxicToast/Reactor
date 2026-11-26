import type { PostMetrics } from '@toxictoast/publisher-domain';
import type { SnapshotRowBase } from './snapshot-row-base.interface.js';

export interface PostSnapshotRow extends SnapshotRowBase, PostMetrics {}
