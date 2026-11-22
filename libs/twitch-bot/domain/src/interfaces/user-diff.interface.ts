import type { UserRef } from './user-ref.interface.js';

export interface UserDiff<T extends UserRef> {
  readonly added: Array<T>;
  readonly removed: Array<T>;
}
