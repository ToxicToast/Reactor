import type { Nullable } from '@toxictoast/shared-types';
import type { LinkId } from '../types/index.js';

/** so, wie der Klick vom Gateway kommt */
export interface RawClick {
  readonly event_id: string;
  readonly link_id: LinkId;
  readonly clicked_at: Date;
  readonly referer: Nullable<string>;
  readonly user_agent: Nullable<string>;
  readonly country: Nullable<string>;
}
