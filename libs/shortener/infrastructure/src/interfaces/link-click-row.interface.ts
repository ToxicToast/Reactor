import type { Nullable } from '@toxictoast/shared-types';

export interface LinkClickRow {
  event_id: string;
  link_id: string;
  clicked_at: Date;
  referrer_host: Nullable<string>;
  device: string;
  browser: string;
  country: Nullable<string>;
}
