import {
  AggregateEditor,
  type DomainPersistence,
  type OAuthTokenStore,
  type UseCase,
} from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  TwitchChannelAnemic,
  TwitchChannelDomain,
  TwitchChannelFactory,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import type { DisconnectChannelInput } from '../data/index.js';
import type { TwitchEventSubscriber } from '../interfaces/index.js';

export class DisconnectChannelUseCase implements UseCase<
  DisconnectChannelInput,
  TwitchChannelAnemic
> {
  private readonly editor: AggregateEditor<
    TwitchChannelAnemic,
    TwitchChannelDomain
  >;

  constructor(
    factory: TwitchChannelFactory,
    repository: TwitchChannelRepository,
    persistence: DomainPersistence,
    private readonly tokens: OAuthTokenStore,
    private readonly subscriber: TwitchEventSubscriber,
  ) {
    this.editor = new AggregateEditor<TwitchChannelAnemic, TwitchChannelDomain>(
      'Twitch channel',
      factory,
      repository,
      persistence,
    );
  }

  async execute(
    input: DisconnectChannelInput,
  ): Promise<Result<TwitchChannelAnemic>> {
    const saved = await this.editor.change(input.id, (channel) => {
      return channel.disconnect();
    });
    if (saved.isFailure) {
      return saved;
    }

    await this.subscriber.stop(saved.value.id);
    await this.tokens.remove(saved.value.id);
    return Result.ok(saved.value);
  }
}
