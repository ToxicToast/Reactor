import type { Nullable } from '@toxictoast/shared-types';
import { YOUTUBE_SCOPES } from '../constants/index.js';
import type {
  YouTubeAuthClient,
  YouTubeAuthorization,
} from '../interfaces/index.js';
import { TEST_NOW } from './test-domain-context.js';
import { YOUTUBE_ID } from './youtube-channel-anemic.fixture.js';

export class FakeYouTubeAuthClient implements YouTubeAuthClient {
  authorization: YouTubeAuthorization = {
    profile: {
      youtube_id: YOUTUBE_ID,
      handle: '@ToxicToastTTV',
      title: 'ToxicToast',
      subscribers: 120,
      video_count: 40,
    },
    token: {
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      scopes: [...YOUTUBE_SCOPES],
      expires_in: 3599,
      obtained_at: TEST_NOW,
    },
  };

  rejectWith: Nullable<Error> = null;

  authorizationUrl(
    state: string,
    redirectUri: string,
    scopes: ReadonlyArray<string>,
  ): string {
    const params = new URLSearchParams({
      state,
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeCode(): Promise<YouTubeAuthorization> {
    if (this.rejectWith) {
      throw this.rejectWith;
    }
    return this.authorization;
  }
}
