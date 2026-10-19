import type { Nullable, Optional } from '@toxictoast/shared-kernel';
import type {
  CategoryAnemic,
  CategoryId,
  CategoryRepository,
} from '@toxictoast/blog-domain';

export class InMemoryCategoryRepository implements CategoryRepository {
  readonly items = new Map<CategoryId, CategoryAnemic>();

  async save(anemic: CategoryAnemic): Promise<CategoryAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<CategoryAnemic>> {
    const all = [...this.items.values()].filter((category) => {
      return withDeleted || category.deleted_at === null;
    });
    return all.slice(offset, limit === undefined ? undefined : offset + limit);
  }

  async findById(
    id: CategoryId,
    withDeleted = false,
  ): Promise<Nullable<CategoryAnemic>> {
    const category = this.items.get(id) ?? null;
    if (category && !withDeleted && category.deleted_at !== null) {
      return null;
    }
    return category;
  }

  async findBySlug(
    slug: string,
    withDeleted = false,
  ): Promise<Nullable<CategoryAnemic>> {
    const category = [...this.items.values()].find((item) => {
      return item.slug === slug;
    });
    if (!category) {
      return null;
    }
    if (!withDeleted && category.deleted_at !== null) {
      return null;
    }
    return category;
  }

  async findByIds(
    ids: ReadonlyArray<CategoryId>,
  ): Promise<Array<CategoryAnemic>> {
    return ids
      .map((id) => this.items.get(id))
      .filter((category): category is CategoryAnemic => {
        return category !== undefined && category.deleted_at === null;
      });
  }

  async findChildren(parentId: CategoryId): Promise<Array<CategoryAnemic>> {
    return [...this.items.values()].filter((category) => {
      return category.parent_id === parentId && category.deleted_at === null;
    });
  }
}
