import type { Nullable, Optional } from '@toxictoast/shared-kernel';
import type {
  CategoryId,
  PostAnemic,
  PostId,
  PostRepository,
  PostStatus,
  TagId,
} from '@toxictoast/blog-domain';

export class InMemoryPostRepository implements PostRepository {
  readonly items = new Map<PostId, PostAnemic>();

  async save(anemic: PostAnemic): Promise<PostAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<PostAnemic>> {
    return this.page(
      [...this.items.values()].filter((post) => {
        return withDeleted || post.deleted_at === null;
      }),
      limit,
      offset,
    );
  }

  async findById(
    id: PostId,
    withDeleted = false,
  ): Promise<Nullable<PostAnemic>> {
    const post = this.items.get(id) ?? null;
    if (post && !withDeleted && post.deleted_at !== null) {
      return null;
    }
    return post;
  }

  async findBySlug(
    slug: string,
    withDeleted = false,
  ): Promise<Nullable<PostAnemic>> {
    const post = [...this.items.values()].find((item) => item.slug === slug);
    if (!post) {
      return null;
    }
    if (!withDeleted && post.deleted_at !== null) {
      return null;
    }
    return post;
  }

  async findByStatus(
    status: PostStatus,
    limit?: Optional<number>,
    offset = 0,
  ): Promise<Array<PostAnemic>> {
    return this.page(
      this.active().filter((post) => post.status === status),
      limit,
      offset,
    );
  }

  async findByCategoryId(
    categoryId: CategoryId,
    limit?: Optional<number>,
    offset = 0,
  ): Promise<Array<PostAnemic>> {
    return this.page(
      this.active().filter((post) => post.category_ids.includes(categoryId)),
      limit,
      offset,
    );
  }

  async findByTagId(
    tagId: TagId,
    limit?: Optional<number>,
    offset = 0,
  ): Promise<Array<PostAnemic>> {
    return this.page(
      this.active().filter((post) => post.tag_ids.includes(tagId)),
      limit,
      offset,
    );
  }

  private active(): Array<PostAnemic> {
    return [...this.items.values()].filter((post) => post.deleted_at === null);
  }

  private page(
    posts: Array<PostAnemic>,
    limit: Optional<number>,
    offset: number,
  ): Array<PostAnemic> {
    return posts.slice(
      offset,
      limit === undefined ? undefined : offset + limit,
    );
  }
}
