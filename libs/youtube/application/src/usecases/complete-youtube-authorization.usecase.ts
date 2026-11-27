import {
  CompleteOAuthUseCase,
  type DomainPersistence,
  type OAuthTokenStore,
} from '@toxictoast/shared-application';
import type { Nullable } from '@toxictoast/shared-types';
import type {
  YouTubeChannelAnemic,
  YouTubeChannelData,
  YouTubeChannelDomain,
  YouTubeChannelFactory,
  YouTubeChannelId,
  YouTubeChannelRepository,
} from '@toxictoast/youtube-domain';
import { YOUTUBE_SCOPES } from '../constants/index.js';
import type {
  YouTubeAuthClient,
  YouTubeAuthorization,
} from '../interfaces/index.js';

export class CompleteYouTubeAuthorizationUseCase extends CompleteOAuthUseCase<
  YouTubeChannelAnemic,
  YouTubeChannelDomain,
  YouTubeChannelData,
  YouTubeAuthorization
> {
  constructor(
    factory: YouTubeChannelFactory,
    private readonly channels: YouTubeChannelRepository,
    persistence: DomainPersistence,
    auth: YouTubeAuthClient,
    tokens: OAuthTokenStore<YouTubeChannelId>,
  ) {
    super(factory, channels, persistence, auth, tokens, YOUTUBE_SCOPES);
  }

  protected dataOf(authorization: YouTubeAuthorization): YouTubeChannelData {
    return {
      youtube_id: authorization.profile.youtube_id,
      handle: authorization.profile.handle,
      title: authorization.profile.title,
      scopes: authorization.token.scopes,
    };
  }

  protected findExisting(
    data: YouTubeChannelData,
  ): Promise<Nullable<YouTubeChannelAnemic>> {
    return this.channels.findByYouTubeId(data.youtube_id);
  }

  /** YouTube hat kein Push wie EventSub; die Zahlen holt der Cronjob */
  protected afterConnect(): Promise<void> {
    return Promise.resolve();
  }
}
