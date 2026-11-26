import type { Nullable } from '@toxictoast/shared-types';
import type { PostRef } from './post-ref.interface.js';

/** wann ein Post zuletzt abgefragt wurde; getrennt vom Post, damit der reine Beobachtung bleibt */
export interface PostCheck {
  readonly post: PostRef;
  readonly checked_at: Date;
  /** Fehlversuche in Folge; ein Erfolg setzt sie auf 0 */
  readonly failures: number;
  readonly last_error: Nullable<string>;
}
