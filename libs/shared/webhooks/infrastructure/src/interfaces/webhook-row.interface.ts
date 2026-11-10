import type { AnemicRow } from '@toxictoast/shared-persistence';
import type { Nullable } from '@toxictoast/shared-types';

export interface WebhookRow extends AnemicRow {
  url: string;
  events: Array<string>;
  description: Nullable<string>;
  active: boolean;
  format: string;
  secret: string;
}
