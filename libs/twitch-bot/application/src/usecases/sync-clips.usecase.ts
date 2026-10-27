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
import { CLIP_LOOKBACK_HOURS } from '../constants/index.js';
import type { SyncClipsOutput } from '../data/index.js';
import { observe } from '../functions/index.js';
import type {
  PublishedClipLedger,
  TwitchClipSource,
} from '../interfaces/index.js';

const HOUR_MS = 3_600_000;

export class SyncClipsUseCase implements UseCase<void, SyncClipsOutput> {
  constructor(
    private readonly channels: TwitchChannelRepository,
    private readonly source: TwitchClipSource,
    private readonly ledger: PublishedClipLedger,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
    private readonly lookbackHours: number = CLIP_LOOKBACK_HOURS,
  ) {}

  async execute(): Promise<Result<SyncClipsOutput>> {
    let created = 0;
    for (const channel of await this.channels.findConnected()) {
      created += await this.sync(channel);
    }
    return Result.ok({ created });
  }

  private async sync(channel: TwitchChannelAnemic): Promise<number> {
    const since = new Date(
      this.ctx.date.now().getTime() - this.lookbackHours * HOUR_MS,
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
      const events = clips
        .filter((clip) => fresh.has(clip.clip_id))
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
        .map((clip) =>
          observe(this.ctx, channel, 'twitch.clip', 'created', clip),
        );

      if (events.length > 0) {
        await this.outbox.add(events);
      }
      return events.length;
    });
  }
}
