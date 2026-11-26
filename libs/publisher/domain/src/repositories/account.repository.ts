import type { Nullable } from '@toxictoast/shared-types';
import type { Account, AccountRef } from '../interfaces/index.js';

export interface AccountRepository {
  /** legt das Konto an oder überschreibt es */
  save(account: Account): Promise<void>;
  find(ref: AccountRef): Promise<Nullable<Account>>;
  list(): Promise<Array<Account>>;
}
