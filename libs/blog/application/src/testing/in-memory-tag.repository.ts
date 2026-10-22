import type { Nullable, Optional } from '@toxictoast/shared-types';
import type { TagAnemic, TagId, TagRepository } from '@toxictoast/blog-domain';

export class InMemoryTagRepository implements TagRepository {
  readonly items = new Map<TagId, TagAnemic>();

  async save(anemic: TagAnemic): Promise<TagAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<TagAnemic>> {
    const all = [...this.items.values()].filter((tag) => {
      return withDeleted || tag.deleted_at === null;
    });
    return all.slice(offset, limit === undefined ? undefined : offset + limit);
  }

  async findById(id: TagId, withDeleted = false): Promise<Nullable<TagAnemic>> {
    const tag = this.items.get(id) ?? null;
    if (tag && !withDeleted && tag.deleted_at !== null) {
      return null;
    }
    return tag;
  }

  async findBySlug(
    slug: string,
    withDeleted = false,
  ): Promise<Nullable<TagAnemic>> {
    const tag = [...this.items.values()].find((item) => item.slug === slug);
    if (!tag) {
      return null;
    }
    if (!withDeleted && tag.deleted_at !== null) {
      return null;
    }
    return tag;
  }

  async findByIds(ids: ReadonlyArray<TagId>): Promise<Array<TagAnemic>> {
    return ids
      .map((id) => this.items.get(id))
      .filter((tag): tag is TagAnemic => {
        return tag !== undefined && tag.deleted_at === null;
      });
  }
}
