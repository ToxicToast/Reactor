import type { Anemic } from '@toxictoast/shared-kernel';
import type { Nullable } from '@toxictoast/shared-types';
import type { LinkId } from '../types/index.js';

export interface LinkAnemic extends Anemic<LinkId> {
  readonly target_url: string;
  readonly description: Nullable<string>;
  readonly active: boolean;
}
