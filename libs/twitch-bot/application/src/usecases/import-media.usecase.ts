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
import type { ImportMediaOutput } from '../data/index.js';
import { observe, oldestFirst, timeWindows } from '../functions/index.js';
import type {
  MediaImportLog,
  PublishedLedger,
  TwitchClip,
  TwitchClipSource,
  TwitchVideoSource,
} from '../interfaces/index.js';

/** Holt einmal pro Kanal alle Clips und VODs; danach reicht der 5-Minuten-Lauf. */
export class ImportMediaUseCase implements UseCase<void, ImportMediaOutput> {
  constructor(
    private readonly channels: TwitchChannelRepository,
    private readonly clips: TwitchClipSource,
    private readonly videos: TwitchVideoSource,
    private readonly clipLedger: PublishedLedger,
    private readonly videoLedger: PublishedLedger,
    private readonly imports: MediaImportLog,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<ImportMediaOutput>> {
    let clips = 0;
    let videos = 0;
    for (const channel of await this.channels.findConnected()) {
      if (await this.imports.isImported(channel.id)) {
        continue;
      }
      const imported = await this.import(channel);
      clips += imported.clips;
      videos += imported.videos;
    }
    return Result.ok({ clips, videos });
  }

  private async import(
    channel: TwitchChannelAnemic,
  ): Promise<ImportMediaOutput> {
    const now = this.ctx.date.now();
    const clips = await this.allClips(channel, now);
    const videos = await this.videos.listAll(channel);

    const events = [
      ...oldestFirst(clips).map((clip) => {
        return observe(
          this.ctx,
          channel,
          MEDIA_EVENTS.CLIP_TOPIC,
          MEDIA_EVENTS.FOUND,
          clip,
        );
      }),
      ...oldestFirst(videos).map((video) => {
        return observe(
          this.ctx,
          channel,
          MEDIA_EVENTS.VIDEO_TOPIC,
          MEDIA_EVENTS.FOUND,
          video,
        );
      }),
    ];

    await this.uow.run(async () => {
      await this.clipLedger.markPublished(
        channel.id,
        clips.map((clip) => clip.clip_id),
      );
      await this.videoLedger.markPublished(
        channel.id,
        videos.map((video) => video.video_id),
      );
      if (events.length > 0) {
        await this.outbox.add(events);
      }
      await this.imports.markImported(channel.id, now);
    });
    return { clips: clips.length, videos: videos.length };
  }

  private async allClips(
    channel: TwitchChannelAnemic,
    now: Date,
  ): Promise<Array<TwitchClip>> {
    const found = new Map<string, TwitchClip>();
    for (const window of timeWindows(
      MEDIA_IMPORT.CLIPS_SINCE,
      now,
      MEDIA_IMPORT.CLIP_WINDOW_DAYS,
    )) {
      for (const clip of await this.clips.listClips(
        channel,
        window.since,
        window.until,
      )) {
        found.set(clip.clip_id, clip);
      }
    }
    return [...found.values()];
  }
}
