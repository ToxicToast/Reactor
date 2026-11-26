import type { Nullable } from '@toxictoast/shared-types';
import type {
  Post,
  PostFilter,
  PostRef,
  PostRepository,
} from '@toxictoast/publisher-domain';
import { refKey } from './ref-key.function.js';

export class InMemoryPostRepository implements PostRepository {
  readonly items = new Map<string, Post>();

  async save(post: Post): Promise<void> {
    const existing = this.items.get(refKey(post));
    this.items.set(refKey(post), {
      ...post,
      origin: existing?.origin ?? post.origin,
    });
  }

  async find(ref: PostRef): Promise<Nullable<Post>> {
    return this.items.get(refKey(ref)) ?? null;
  }

  async list(
    filter: PostFilter,
    limit: number,
    offset = 0,
  ): Promise<Array<Post>> {
    return [...this.items.values()]
      .filter((post) => {
        return (
          (filter.platform === null || post.platform === filter.platform) &&
          (filter.account_remote_id === null ||
            post.account_remote_id === filter.account_remote_id)
        );
      })
      .sort((a, b) => b.published_at.getTime() - a.published_at.getTime())
      .slice(offset, offset + limit);
  }

  /** nur für Tests; das echte Repository kennt keinen Rückgabewert dafür */
  all(): Array<Post> {
    return [...this.items.values()];
  }
}
