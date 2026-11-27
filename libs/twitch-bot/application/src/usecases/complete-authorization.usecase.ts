import {
  CompleteOAuthUseCase,
  type DomainPersistence,
  type OAuthTokenStore,
} from '@toxictoast/shared-application';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  TwitchChannelAnemic,
  TwitchChannelData,
  TwitchChannelDomain,
  TwitchChannelFactory,
  TwitchChannelRepository,
} from '@toxictoast/twitch-bot-domain';
import { TWITCH_BOT_SCOPES } from '../constants/index.js';
import type {
  TwitchAuthClient,
  TwitchAuthorization,
  TwitchEventSubscriber,
} from '../interfaces/index.js';

export class CompleteAuthorizationUseCase extends CompleteOAuthUseCase<
  TwitchChannelAnemic,
  TwitchChannelDomain,
  TwitchChannelData,
  TwitchAuthorization
> {
  constructor(
    factory: TwitchChannelFactory,
    private readonly channels: TwitchChannelRepository,
    persistence: DomainPersistence,
    auth: TwitchAuthClient,
    tokens: OAuthTokenStore,
    private readonly subscriber: TwitchEventSubscriber,
  ) {
    super(factory, channels, persistence, auth, tokens, TWITCH_BOT_SCOPES);
  }

  protected dataOf(authorization: TwitchAuthorization): TwitchChannelData {
    return { ...authorization.user, scopes: authorization.token.scopes };
  }

  protected findExisting(
    data: TwitchChannelData,
  ): Promise<Nullable<TwitchChannelAnemic>> {
    return this.channels.findByTwitchId(data.twitch_id);
  }

  protected afterConnect(channel: TwitchChannelAnemic): Promise<void> {
    return this.subscriber.start(channel);
  }
}
