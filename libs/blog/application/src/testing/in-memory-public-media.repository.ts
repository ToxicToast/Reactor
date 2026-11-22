import type { MediaId, PublicMediaRepository } from '@toxictoast/blog-domain';

export class InMemoryPublicMediaRepository implements PublicMediaRepository {
  readonly items = new Map<MediaId, Date>();

  async findAll(): Promise<Array<MediaId>> {
    return [...this.items.keys()];
  }

  async add(id: MediaId, at: Date): Promise<void> {
    this.items.set(id, at);
  }

  async remove(id: MediaId): Promise<void> {
    this.items.delete(id);
  }
}
