import type {
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type { TwitchChannelRepository } from '@toxictoast/twitch-bot-domain';
import { FOLLOWER_EVENTS } from '../constants/index.js';
import type { SyncFollowerCountsOutput } from '../data/index.js';
import type { TwitchObservedEvent } from '../events/index.js';
import { observe } from '../functions/index.js';
import type {
  FollowerCountPayload,
  TwitchFollowerSource,
} from '../interfaces/index.js';
import type { TrackedChannels } from '../services/index.js';

/** Gesamtzahl für eigene Channels und Freunde; ohne verbundenen Channel gibt es keinen Token dafür. */
export class SyncFollowerCountsUseCase implements UseCase<
  void,
  SyncFollowerCountsOutput
> {
  constructor(
    private readonly owned: TwitchChannelRepository,
    private readonly channels: TrackedChannels,
    private readonly source: TwitchFollowerSource,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<SyncFollowerCountsOutput>> {
    const [via] = await this.owned.findConnected();
    if (!via) {
      return Result.ok({ counted: 0 });
    }

    const events: Array<TwitchObservedEvent<object>> = [];
    for (const channel of await this.channels.list()) {
      const payload: FollowerCountPayload = {
        total: await this.source.countFollowers(channel, via),
      };
      events.push(
        observe(
          this.ctx,
          channel,
          FOLLOWER_EVENTS.TOPIC,
          FOLLOWER_EVENTS.COUNT,
          payload,
        ),
      );
    }

    if (events.length > 0) {
      await this.uow.run(() => this.outbox.add(events));
    }
    return Result.ok({ counted: events.length });
  }
}
