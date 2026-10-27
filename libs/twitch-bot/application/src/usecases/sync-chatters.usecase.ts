import type {
  Outbox,
  UnitOfWork,
  UseCase,
} from '@toxictoast/shared-application';
import { Result, type DomainContext } from '@toxictoast/shared-kernel';
import type {
  Chatter,
  ChatterDiff,
  ChatterDiffService,
  ChatterRepository,
  TwitchChannelAnemic,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import type { SyncChattersOutput } from '../data/index.js';
import { observe } from '../functions/index.js';
import type { TwitchChatterSource } from '../interfaces/index.js';

export class SyncChattersUseCase implements UseCase<void, SyncChattersOutput> {
  constructor(
    private readonly channels: TwitchChannelRepository,
    private readonly chatters: ChatterRepository,
    private readonly source: TwitchChatterSource,
    private readonly differ: ChatterDiffService,
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
    private readonly ctx: DomainContext,
  ) {}

  async execute(): Promise<Result<SyncChattersOutput>> {
    let joined = 0;
    let left = 0;

    for (const channel of await this.channels.findConnected()) {
      const diff = await this.sync(channel);
      joined += diff.joined.length;
      left += diff.left.length;
    }

    return Result.ok({ joined, left });
  }

  private async sync(channel: TwitchChannelAnemic): Promise<ChatterDiff> {
    const current = this.unique(await this.source.listChatters(channel));
    const previous = await this.chatters.findByChannel(channel.id);
    const diff = this.differ.diff(previous, current);
    if (diff.joined.length === 0 && diff.left.length === 0) {
      return diff;
    }

    const events = [
      ...diff.joined.map((chatter) => {
        return observe(this.ctx, channel, 'twitch.presence', 'joined', chatter);
      }),
      ...diff.left.map((chatter) => {
        return observe(this.ctx, channel, 'twitch.presence', 'left', chatter);
      }),
    ];

    await this.uow.run(async () => {
      await this.chatters.replace(channel.id, current);
      await this.outbox.add(events);
    });
    return diff;
  }

  private unique(chatters: ReadonlyArray<Chatter>): Array<Chatter> {
    return [
      ...new Map(
        chatters.map((chatter) => [chatter.user_id, chatter]),
      ).values(),
    ];
  }
}
