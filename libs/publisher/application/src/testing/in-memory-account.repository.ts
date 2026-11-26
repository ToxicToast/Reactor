import type { Nullable } from '@toxictoast/shared-types';
import type {
  Account,
  AccountRef,
  AccountRepository,
} from '@toxictoast/publisher-domain';
import { refKey } from './ref-key.function.js';

export class InMemoryAccountRepository implements AccountRepository {
  readonly items = new Map<string, Account>();

  async save(account: Account): Promise<void> {
    this.items.set(refKey(account), account);
  }

  async find(ref: AccountRef): Promise<Nullable<Account>> {
    return this.items.get(refKey(ref)) ?? null;
  }

  async list(): Promise<Array<Account>> {
    return [...this.items.values()];
  }
}
