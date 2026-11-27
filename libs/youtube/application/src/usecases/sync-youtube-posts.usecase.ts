import type {
  ObservedEvent,
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type { YouTubeChannelRepository } from '@toxictoast/youtube-domain';
import type { SyncYouTubePostsOutput } from '../data/index.js';
import { socialPostObserved, publishObserved } from '@toxictoast/shared-social';
import { postObservationOf } from '../functions/index.js';
import type {
  YouTubeAnalyticsSource,
  YouTubeVideoSource,
} from '../interfaces/index.js';

/** Import: jedes Video der Upload-Playlist mit seinem heutigen Stand */
export class SyncYouTubePostsUseCase implements UseCase<
  void,
  SyncYouTubePostsOutput
> {
  constructor(
    private readonly channels: YouTubeChannelRepository,
    private readonly videos: YouTubeVideoSource,
    private readonly analytics: YouTubeAnalyticsSource,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<SyncYouTubePostsOutput>> {
    const events: Array<ObservedEvent> = [];
    for (const channel of await this.channels.findConnected()) {
      const ids = await this.videos.listUploadIds(channel);
      for (const video of await this.videos.videos(channel, ids)) {
        const analytics = await this.analytics.videoAnalytics(
          channel,
          video.video_id,
        );
        events.push(
          socialPostObserved(
            this.ctx,
            postObservationOf(channel, video, analytics),
          ),
        );
      }
    }

    await publishObserved(this.outbox, this.uow, events);
    return Result.ok({ observed: events.length });
  }
}
