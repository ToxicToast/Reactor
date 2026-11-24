import type {
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import { TIME_MS } from '@toxictoast/shared-types';
import type { TrackedChannel } from '@toxictoast/twitch-bot-domain';
import { CLIP_LOOKBACK_HOURS, MEDIA_EVENTS } from '../constants/index.js';
import type { SyncClipsOutput } from '../data/index.js';
import { observe, oldestFirst } from '../functions/index.js';
import type { PublishedLedger, TwitchClipSource } from '../interfaces/index.js';
import type { TrackedChannels } from '../services/index.js';

export class SyncClipsUseCase implements UseCase<void, SyncClipsOutput> {
  constructor(
    private readonly channels: TrackedChannels,
    private readonly source: TwitchClipSource,
    private readonly ledger: PublishedLedger,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
    private readonly lookbackHours: number = CLIP_LOOKBACK_HOURS,
  ) {}

  async execute(): Promise<Result<SyncClipsOutput>> {
    let created = 0;
    for (const channel of await this.channels.list()) {
      created += await this.sync(channel);
    }
    return Result.ok({ created });
  }

  private async sync(channel: TrackedChannel): Promise<number> {
    const since = new Date(
      this.ctx.date.now().getTime() - this.lookbackHours * TIME_MS.HOUR,
    );
    const clips = await this.source.listClips(channel, since);
    if (clips.length === 0) {
      return 0;
    }

    return this.uow.run(async () => {
      const fresh = new Set(
        await this.ledger.markPublished(
          channel.id,
          clips.map((clip) => clip.clip_id),
        ),
      );
      const events = oldestFirst(
        clips.filter((clip) => fresh.has(clip.clip_id)),
      ).map((clip) => {
        return observe(
          this.ctx,
          channel,
          MEDIA_EVENTS.CLIP_TOPIC,
          MEDIA_EVENTS.CREATED,
          clip,
        );
      });

      if (events.length > 0) {
        await this.outbox.add(events);
      }
      return events.length;
    });
  }
}
