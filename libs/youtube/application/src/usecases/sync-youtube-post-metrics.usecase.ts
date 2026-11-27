import type {
  ObservedEvent,
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type { YouTubeChannelRepository } from '@toxictoast/youtube-domain';
import { YOUTUBE_MESSAGES } from '../constants/index.js';
import type {
  SyncYouTubePostMetricsInput,
  SyncYouTubePostMetricsOutput,
} from '../data/index.js';
import {
  SocialPlatforms,
  socialPostCheckFailed,
  socialPostObserved,
  publishObserved,
} from '@toxictoast/shared-social';
import { postObservationOf } from '../functions/index.js';
import type {
  YouTubeAnalyticsSource,
  YouTubeVideoSource,
} from '../interfaces/index.js';

/**
 * Für den Cronjob: die fälligen Videos aus dem publisher-service. Ein Video,
 * das videos.list nicht mehr kennt, ist ein Fehlversuch. Ein Ausfall der
 * ganzen Abfrage wirft dagegen: Er hat mit keinem einzelnen Video zu tun und
 * darf deshalb keines näher an das Aussetzen bringen.
 */
export class SyncYouTubePostMetricsUseCase implements UseCase<
  SyncYouTubePostMetricsInput,
  SyncYouTubePostMetricsOutput
> {
  constructor(
    private readonly channels: YouTubeChannelRepository,
    private readonly videos: YouTubeVideoSource,
    private readonly analytics: YouTubeAnalyticsSource,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(
    input: SyncYouTubePostMetricsInput,
  ): Promise<Result<SyncYouTubePostMetricsOutput>> {
    const [channel] = await this.channels.findConnected();
    if (!channel || input.remote_ids.length === 0) {
      return Result.ok({ observed: 0, failed: 0 });
    }

    const found = new Map(
      (await this.videos.videos(channel, input.remote_ids)).map((video) => {
        return [video.video_id, video];
      }),
    );

    const events: Array<ObservedEvent> = [];
    let failed = 0;
    for (const remoteId of input.remote_ids) {
      const video = found.get(remoteId);
      if (!video) {
        failed++;
        events.push(
          socialPostCheckFailed(this.ctx, {
            platform: SocialPlatforms.YOUTUBE,
            remote_id: remoteId,
            error: YOUTUBE_MESSAGES.VIDEO_NOT_FOUND,
          }),
        );
        continue;
      }

      const analytics = await this.analytics.videoAnalytics(channel, remoteId);
      events.push(
        socialPostObserved(
          this.ctx,
          postObservationOf(channel, video, analytics),
        ),
      );
    }

    await publishObserved(this.outbox, this.uow, events);
    return Result.ok({ observed: events.length - failed, failed });
  }
}
