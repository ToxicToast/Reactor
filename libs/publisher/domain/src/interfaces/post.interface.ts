import type { Nullable } from '@toxictoast/shared-types';
import type { PostOrigin } from '../types/index.js';
import type { PostRef } from './post-ref.interface.js';

export interface Post extends PostRef {
  /** remote_id des Kontos auf derselben Plattform */
  readonly account_remote_id: string;
  readonly url: string;
  /** YouTube-Titel bzw. erste Zeile der Caption */
  readonly title: Nullable<string>;
  readonly published_at: Date;
  readonly duration_seconds: Nullable<number>;
  readonly origin: PostOrigin;
}
