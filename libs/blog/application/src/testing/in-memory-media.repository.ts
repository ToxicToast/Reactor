import type { Nullable, Optional } from '@toxictoast/shared-kernel';
import type {
  MediaAnemic,
  MediaId,
  MediaRepository,
  MediaStatus,
} from '@toxictoast/blog-domain';

export class InMemoryMediaRepository implements MediaRepository {
  readonly items = new Map<MediaId, MediaAnemic>();

  async save(anemic: MediaAnemic): Promise<MediaAnemic> {
    this.items.set(anemic.id, anemic);
    return anemic;
  }

  async findList(
    limit?: Optional<number>,
    offset = 0,
    withDeleted = false,
  ): Promise<Array<MediaAnemic>> {
    const all = [...this.items.values()].filter((media) => {
      return withDeleted || media.deleted_at === null;
    });
    return all.slice(offset, limit === undefined ? undefined : offset + limit);
  }

  async findById(
    id: MediaId,
    withDeleted = false,
  ): Promise<Nullable<MediaAnemic>> {
    const media = this.items.get(id) ?? null;
    if (media && !withDeleted && media.deleted_at !== null) {
      return null;
    }
    return media;
  }

  async findByIds(ids: ReadonlyArray<MediaId>): Promise<Array<MediaAnemic>> {
    return ids
      .map((id) => this.items.get(id))
      .filter((media): media is MediaAnemic => {
        return media !== undefined && media.deleted_at === null;
      });
  }

  async findByStatus(
    status: MediaStatus,
    olderThan?: Optional<Date>,
  ): Promise<Array<MediaAnemic>> {
    return [...this.items.values()].filter((media) => {
      if (media.deleted_at !== null || media.status !== status) {
        return false;
      }
      return olderThan === undefined || media.created_at < olderThan;
    });
  }
}
