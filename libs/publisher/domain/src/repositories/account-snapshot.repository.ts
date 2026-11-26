import type { Nullable } from '@toxictoast/shared-types';
import type { AccountRef, AccountSnapshot } from '../interfaces/index.js';

export interface AccountSnapshotRepository {
  latest(account: AccountRef): Promise<Nullable<AccountSnapshot>>;
  /** hängt einen Stand an; ob er sich geändert hat, entscheidet der Aufrufer */
  record(snapshot: AccountSnapshot): Promise<void>;
}
