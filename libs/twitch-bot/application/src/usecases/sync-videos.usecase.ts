import type {
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type {
  TwitchChannelAnemic,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import { MEDIA_EVENTS, MEDIA_IMPORT } from '../constants/index.js';
import type { SyncVideosOutput } from '../data/index.js';
import { observe, oldestFirst } from '../functions/index.js';
import type {
  PublishedLedger,
  TwitchVideoSource,
} from '../interfaces/index.js';

export class SyncVideosUseCase implements UseCase<void, SyncVideosOutput> {
  constructor(
    private readonly channels: TwitchChannelRepository,
    private readonly source: TwitchVideoSource,
    private readonly ledger: PublishedLedger,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<SyncVideosOutput>> {
    let created = 0;
    for (const channel of await this.channels.findConnected()) {
      created += await this.sync(channel);
    }
    return Result.ok({ created });
  }

  private async sync(channel: TwitchChannelAnemic): Promise<number> {
    const videos = await this.source.listRecent(
      channel,
      MEDIA_IMPORT.RECENT_VIDEOS,
    );
    if (videos.length === 0) {
      return 0;
    }

    return this.uow.run(async () => {
      const fresh = new Set(
        await this.ledger.markPublished(
          channel.id,
          videos.map((video) => video.video_id),
        ),
      );
      const events = oldestFirst(
        videos.filter((video) => fresh.has(video.video_id)),
      ).map((video) => {
        return observe(
          this.ctx,
          channel,
          MEDIA_EVENTS.VIDEO_TOPIC,
          MEDIA_EVENTS.CREATED,
          video,
        );
      });

      if (events.length > 0) {
        await this.outbox.add(events);
      }
      return events.length;
    });
  }
}
