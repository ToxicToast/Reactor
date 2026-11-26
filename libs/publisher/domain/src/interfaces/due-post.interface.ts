import type { Nullable } from '@toxictoast/shared-types';
import type { PostRef } from './post-ref.interface.js';

/** was der Cronjob braucht, um über die nächste Abfrage zu entscheiden */
export interface DuePost {
  readonly post: PostRef;
  readonly published_at: Date;
  readonly checked_at: Nullable<Date>;
}
