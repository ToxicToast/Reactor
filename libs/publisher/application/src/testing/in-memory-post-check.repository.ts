import type { Nullable } from '@toxictoast/shared-types';
import {
  postRefOf,
  type DuePost,
  type PostCheck,
  type PostCheckRepository,
  type PostRef,
} from '@toxictoast/publisher-domain';
import type { InMemoryPostRepository } from './in-memory-post.repository.js';
import { refKey } from './ref-key.function.js';

export class InMemoryPostCheckRepository implements PostCheckRepository {
  readonly items = new Map<string, PostCheck>();

  constructor(private readonly posts: InMemoryPostRepository) {}

  async find(post: PostRef): Promise<Nullable<PostCheck>> {
    return this.items.get(refKey(post)) ?? null;
  }

  async save(check: PostCheck): Promise<void> {
    this.items.set(refKey(check.post), check);
  }

  async candidates(maxFailures: number): Promise<Array<DuePost>> {
    return this.posts
      .all()
      .map((post) => {
        const check = this.items.get(refKey(post)) ?? null;
        return {
          due: {
            post: postRefOf(post),
            published_at: post.published_at,
            checked_at: check?.checked_at ?? null,
          },
          failures: check?.failures ?? 0,
        };
      })
      .filter((candidate) => candidate.failures < maxFailures)
      .map((candidate) => candidate.due)
      .sort((a, b) => {
        return (
          (a.checked_at?.getTime() ?? -Infinity) -
          (b.checked_at?.getTime() ?? -Infinity)
        );
      });
  }
}
