import type { Nullable } from '@toxictoast/shared-types';
import type { LinkId } from '../types/index.js';

export interface LinkEventPayload {
  readonly id: LinkId;
  readonly target_url: string;
  readonly description: Nullable<string>;
  readonly active: boolean;
  readonly created_at: Date;
  readonly updated_at: Nullable<Date>;
  readonly deleted_at: Nullable<Date>;
}
