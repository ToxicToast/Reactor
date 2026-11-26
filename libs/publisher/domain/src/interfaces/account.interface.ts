import type { Nullable } from '@toxictoast/shared-types';
import type { AccountRef } from './account-ref.interface.js';

export interface Account extends AccountRef {
  readonly handle: string;
  readonly display_name: Nullable<string>;
  readonly url: Nullable<string>;
}
