import type { Nullable } from '@toxictoast/shared-types';
import type { PostRef, PostSnapshot } from '../interfaces/index.js';

export interface PostSnapshotRepository {
  latest(post: PostRef): Promise<Nullable<PostSnapshot>>;
  /** hängt einen Stand an; ob er sich geändert hat, entscheidet der Aufrufer */
  record(snapshot: PostSnapshot): Promise<void>;
}
