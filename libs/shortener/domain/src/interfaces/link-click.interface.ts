import type { Nullable } from '@toxictoast/shared-types';
import type { ClickBrowser, ClickDevice, LinkId } from '../types/index.js';

/** gespeicherter Klick, ausgewertet und ohne Rohdaten */
export interface LinkClick {
  readonly event_id: string;
  readonly link_id: LinkId;
  readonly clicked_at: Date;
  readonly referrer_host: Nullable<string>;
  readonly device: ClickDevice;
  readonly browser: ClickBrowser;
  readonly country: Nullable<string>;
}
