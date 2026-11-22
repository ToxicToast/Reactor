import type { FileStorage, UseCase } from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import {
  MediaStatus,
  type MediaId,
  type MediaRepository,
  type PostRepository,
  type PublicMediaRepository,
} from '@toxictoast/blog-domain';
import type {
  SyncPublicMediaInput,
  SyncPublicMediaOutput,
} from '../../data/index.js';
import { publicMediaKey } from '../../functions/index.js';

/** Öffentlich ist ein Bild genau dann, wenn es in einem veröffentlichten Post steckt. */
export class SyncPublicMediaUseCase implements UseCase<
  SyncPublicMediaInput,
  SyncPublicMediaOutput
> {
  constructor(
    private readonly posts: PostRepository,
    private readonly media: MediaRepository,
    private readonly publicMedia: PublicMediaRepository,
    private readonly storage: FileStorage,
    private readonly ctx: DomainContext,
  ) {}

  async execute(
    input: SyncPublicMediaInput,
  ): Promise<Result<SyncPublicMediaOutput>> {
    const wanted = new Set(await this.posts.findPublishedImageIds());
    const current = new Set(await this.publicMedia.findAll());
    const candidates = input.media_ids ?? [...wanted, ...current];

    let published = 0;
    let removed = 0;
    for (const id of new Set(candidates)) {
      if (wanted.has(id) && !current.has(id)) {
        if (await this.publish(id)) {
          published++;
        }
      }
      if (!wanted.has(id) && current.has(id)) {
        await this.unpublish(id);
        removed++;
      }
    }
    return Result.ok({ published, removed });
  }

  private async publish(id: MediaId): Promise<boolean> {
    const media = await this.media.findById(id);
    if (!media || media.status !== MediaStatus.READY) {
      return false;
    }
    await this.storage.copy(media.object_key, publicMediaKey(id));
    await this.publicMedia.add(id, this.ctx.date.now());
    return true;
  }

  private async unpublish(id: MediaId): Promise<void> {
    await this.storage.delete(publicMediaKey(id));
    await this.publicMedia.remove(id);
  }
}
