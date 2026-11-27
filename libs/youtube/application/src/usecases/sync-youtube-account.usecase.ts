import type {
  ObservedEvent,
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type { YouTubeChannelRepository } from '@toxictoast/youtube-domain';
import type { SyncYouTubeAccountOutput } from '../data/index.js';
import {
  socialAccountObserved,
  publishObserved,
} from '@toxictoast/shared-social';
import { accountObservationOf } from '../functions/index.js';
import type { YouTubeChannelSource } from '../interfaces/index.js';

/** Abonnenten und Videoanzahl jedes verbundenen Kanals nach social.account */
export class SyncYouTubeAccountUseCase implements UseCase<
  void,
  SyncYouTubeAccountOutput
> {
  constructor(
    private readonly channels: YouTubeChannelRepository,
    private readonly source: YouTubeChannelSource,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<SyncYouTubeAccountOutput>> {
    const events: Array<ObservedEvent> = [];
    for (const channel of await this.channels.findConnected()) {
      const profile = await this.source.profile(channel);
      events.push(
        socialAccountObserved(this.ctx, accountObservationOf(profile)),
      );
    }

    await publishObserved(this.outbox, this.uow, events);
    return Result.ok({ observed: events.length });
  }
}
