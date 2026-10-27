import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  TwitchChannelAnemic,
  TwitchChannelFactory,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import type { RevokeChannelInput } from '../data/index.js';
import type {
  TwitchEventSubscriber,
  TwitchTokenStore,
} from '../interfaces/index.js';

export class RevokeChannelUseCase implements UseCase<
  RevokeChannelInput,
  TwitchChannelAnemic
> {
  constructor(
    private readonly factory: TwitchChannelFactory,
    private readonly repository: TwitchChannelRepository,
    private readonly persistence: DomainPersistence,
    private readonly tokens: TwitchTokenStore,
    private readonly subscriber: TwitchEventSubscriber,
  ) {}

  async execute(
    input: RevokeChannelInput,
  ): Promise<Result<TwitchChannelAnemic>> {
    const anemic = await this.repository.findByTwitchId(input.twitch_id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Twitch channel', input.twitch_id));
    }
    if (!anemic.connected) {
      return Result.ok(anemic);
    }

    const channel = this.factory.reconstitute(anemic);
    const revoked = channel.revoke();
    if (revoked.isFailure) {
      return Result.fail(revoked.error);
    }

    const saved = await this.persistence.persist(channel, this.repository);
    if (saved.isFailure) {
      return Result.fail(saved.error);
    }

    await this.subscriber.stop(saved.value.id);
    await this.tokens.remove(saved.value.id);
    return Result.ok(saved.value);
  }
}
