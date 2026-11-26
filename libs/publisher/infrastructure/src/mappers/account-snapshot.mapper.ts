import type { AccountSnapshot } from '@toxictoast/publisher-domain';
import type { AccountSnapshotRow } from '../interfaces/index.js';

export class AccountSnapshotMapper {
  toSnapshot(row: AccountSnapshotRow): AccountSnapshot {
    const { platform, remote_id, observed_at, ...metrics } = row;
    return { account: { platform, remote_id }, observed_at, metrics };
  }

  toRow(snapshot: AccountSnapshot): AccountSnapshotRow {
    return {
      ...snapshot.account,
      observed_at: snapshot.observed_at,
      ...snapshot.metrics,
    };
  }
}
