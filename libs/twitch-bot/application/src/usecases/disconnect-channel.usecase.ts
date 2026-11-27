import {
  DisconnectOAuthUseCase,
  type DomainPersistence,
  type OAuthTokenStore,
} from '@toxictoast/shared-application';
import type {
  TwitchChannelAnemic,
  TwitchChannelDomain,
  TwitchChannelFactory,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import type { TwitchEventSubscriber } from '../interfaces/index.js';

export class DisconnectChannelUseCase extends DisconnectOAuthUseCase<
  TwitchChannelAnemic,
  TwitchChannelDomain
> {
  constructor(
    factory: TwitchChannelFactory,
    repository: TwitchChannelRepository,
    persistence: DomainPersistence,
    tokens: OAuthTokenStore,
    private readonly subscriber: TwitchEventSubscriber,
  ) {
    super('Twitch channel', factory, repository, persistence, tokens);
  }

  protected beforeTokenRemoval(channel: TwitchChannelAnemic): Promise<void> {
    return this.subscriber.stop(channel.id);
  }
}
