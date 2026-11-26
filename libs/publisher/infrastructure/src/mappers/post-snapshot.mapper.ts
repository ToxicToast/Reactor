import type { PostSnapshot } from '@toxictoast/publisher-domain';
import type { PostSnapshotRow } from '../interfaces/index.js';

export class PostSnapshotMapper {
  toSnapshot(row: PostSnapshotRow): PostSnapshot {
    const { platform, remote_id, observed_at, ...metrics } = row;
    return { post: { platform, remote_id }, observed_at, metrics };
  }

  toRow(snapshot: PostSnapshot): PostSnapshotRow {
    return {
      ...snapshot.post,
      observed_at: snapshot.observed_at,
      ...snapshot.metrics,
    };
  }
}
