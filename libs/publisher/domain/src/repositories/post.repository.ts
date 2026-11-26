import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { Post, PostFilter, PostRef } from '../interfaces/index.js';

export interface PostRepository {
  /** legt den Post an oder überschreibt ihn; die Herkunft eines vorhandenen Posts bleibt erhalten */
  save(post: Post): Promise<void>;
  find(ref: PostRef): Promise<Nullable<Post>>;
  list(
    filter: PostFilter,
    limit: number,
    offset?: Optional<number>,
  ): Promise<Array<Post>>;
}
