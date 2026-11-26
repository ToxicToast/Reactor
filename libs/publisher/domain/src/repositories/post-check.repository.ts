import type { Nullable } from '@toxictoast/shared-types';
import type { DuePost, PostCheck, PostRef } from '../interfaces/index.js';

export interface PostCheckRepository {
  find(post: PostRef): Promise<Nullable<PostCheck>>;
  save(check: PostCheck): Promise<void>;
  /** alle Posts mit weniger als maxFailures Fehlversuchen; noch nie abgefragte vorneweg, dann die älteste Abfrage zuerst */
  candidates(maxFailures: number): Promise<Array<DuePost>>;
}
