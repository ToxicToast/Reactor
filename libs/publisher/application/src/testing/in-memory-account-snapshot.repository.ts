import type { Nullable } from '@toxictoast/shared-types';
import type {
  AccountRef,
  AccountSnapshot,
  AccountSnapshotRepository,
} from '@toxictoast/publisher-domain';
import { InMemorySnapshotLog } from './in-memory-snapshot-log.js';

export class InMemoryAccountSnapshotRepository
  extends InMemorySnapshotLog<AccountSnapshot>
  implements AccountSnapshotRepository
{
  constructor() {
    super((snapshot) => snapshot.account);
  }

  async latest(account: AccountRef): Promise<Nullable<AccountSnapshot>> {
    return this.latestFor(account);
  }

  async record(snapshot: AccountSnapshot): Promise<void> {
    this.append(snapshot);
  }
}
