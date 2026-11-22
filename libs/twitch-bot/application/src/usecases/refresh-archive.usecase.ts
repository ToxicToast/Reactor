import type {
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import {
  MEDIA_EVENTS,
  MEDIA_IMPORT,
  TwitchVideoTypes,
} from '../constants/index.js';
import type { RefreshArchiveInput } from '../data/index.js';
import { observe } from '../functions/index.js';
import type {
  PublishedLedger,
  TwitchVideoSource,
} from '../interfaces/index.js';

/** Twitch legt das Archiv schon beim Streamstart an; nach dem Ende stimmt erst die Länge. */
export class RefreshArchiveUseCase implements UseCase<
  RefreshArchiveInput,
  boolean
> {
  constructor(
    private readonly source: TwitchVideoSource,
    private readonly ledger: PublishedLedger,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(input: RefreshArchiveInput): Promise<Result<boolean>> {
    const videos = await this.source.listRecent(
      input.channel,
      MEDIA_IMPORT.RECENT_VIDEOS,
    );
    const archive = videos.find((video) => {
      return video.type === TwitchVideoTypes.ARCHIVE;
    });
    if (!archive) {
      return Result.ok(false);
    }

    await this.uow.run(async () => {
      await this.ledger.markPublished(input.channel.id, [archive.video_id]);
      await this.outbox.add([
        observe(
          this.ctx,
          input.channel,
          MEDIA_EVENTS.VIDEO_TOPIC,
          MEDIA_EVENTS.UPDATED,
          archive,
        ),
      ]);
    });
    return Result.ok(true);
  }
}
