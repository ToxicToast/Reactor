import {
  DisconnectOAuthUseCase,
  type DomainPersistence,
  type OAuthTokenStore,
} from '@toxictoast/shared-application';
import type {
  YouTubeChannelAnemic,
  YouTubeChannelDomain,
  YouTubeChannelFactory,
  YouTubeChannelId,
  YouTubeChannelRepository,
} from '@toxictoast/youtube-domain';
import { YOUTUBE_NAMES } from '../constants/index.js';

export class DisconnectYouTubeChannelUseCase extends DisconnectOAuthUseCase<
  YouTubeChannelAnemic,
  YouTubeChannelDomain
> {
  constructor(
    factory: YouTubeChannelFactory,
    repository: YouTubeChannelRepository,
    persistence: DomainPersistence,
    tokens: OAuthTokenStore<YouTubeChannelId>,
  ) {
    super(YOUTUBE_NAMES.CHANNEL, factory, repository, persistence, tokens);
  }

  /** bei YouTube gibt es nichts abzumelden */
  protected beforeTokenRemoval(): Promise<void> {
    return Promise.resolve();
  }
}
