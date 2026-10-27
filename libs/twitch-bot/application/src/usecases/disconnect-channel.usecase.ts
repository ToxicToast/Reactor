import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  TwitchChannelAnemic,
  TwitchChannelFactory,
  TwitchChannelId,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import type { DisconnectChannelInput } from '../data/index.js';
import type {
  TwitchEventSubscriber,
  TwitchTokenStore,
} from '../interfaces/index.js';

export class DisconnectChannelUseCase implements UseCase<
  DisconnectChannelInput,
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
    input: DisconnectChannelInput,
  ): Promise<Result<TwitchChannelAnemic>> {
    const anemic = await this.repository.findById(input.id as TwitchChannelId);
    if (!anemic) {
      return Result.fail(new NotFoundError('Twitch channel', input.id));
    }

    const channel = this.factory.reconstitute(anemic);
    const disconnected = channel.disconnect();
    if (disconnected.isFailure) {
      return Result.fail(disconnected.error);
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
