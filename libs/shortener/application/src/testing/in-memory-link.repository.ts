import type { Nullable, Optional } from '@toxictoast/shared-types';
import type {
  LinkAnemic,
  LinkId,
  LinkRepository,
} from '@toxictoast/shortener-domain';

export class InMemoryLinkRepository implements LinkRepository {
  readonly items = new Map<LinkId, LinkAnemic>();

  async save(anemic: LinkAnemic): Promise<LinkAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<LinkAnemic>> {
    const all = [...this.items.values()].filter((link) => {
      return withDeleted || link.deleted_at === null;
    });
    return all.slice(offset, limit === undefined ? undefined : offset + limit);
  }

  async findById(
    id: LinkId,
    withDeleted = false,
  ): Promise<Nullable<LinkAnemic>> {
    const link = this.items.get(id) ?? null;
    if (link && !withDeleted && link.deleted_at !== null) {
      return null;
    }
    return link;
  }
}
