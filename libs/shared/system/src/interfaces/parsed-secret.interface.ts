import type { Nullable } from '@toxictoast/shared-types';

export interface ParsedSecret {
  /** null bei v1-Werten, die noch ohne Key-ID verschlüsselt wurden */
  readonly keyId: Nullable<string>;
  readonly iv: string;
  readonly tag: string;
  readonly data: string;
}
