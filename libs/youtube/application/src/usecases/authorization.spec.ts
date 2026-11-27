import { DomainPersistence } from '@toxictoast/shared-application';
import {
  ImmediateUnitOfWork,
  InMemoryOAuthTokenStore,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import {
  YouTubeChannelFactory,
  type YouTubeChannelId,
} from '@toxictoast/youtube-domain';
import {
  createTestContext,
  FakeYouTubeAuthClient,
  InMemoryYouTubeChannelRepository,
} from '../testing/index.js';
import { CompleteYouTubeAuthorizationUseCase } from './complete-youtube-authorization.usecase.js';
import { DisconnectYouTubeChannelUseCase } from './disconnect-youtube-channel.usecase.js';

const INPUT = {
  code: 'code-1',
  redirect_uri: 'https://api.thoraxia.de/admin/youtube/callback',
};

describe('YouTube authorization', () => {
  let auth: FakeYouTubeAuthClient;
  let channels: InMemoryYouTubeChannelRepository;
  let tokens: InMemoryOAuthTokenStore<YouTubeChannelId>;
  let outbox: InMemoryOutbox;
  let complete: CompleteYouTubeAuthorizationUseCase;
  let disconnect: DisconnectYouTubeChannelUseCase;

  beforeEach(() => {
    const factory = new YouTubeChannelFactory(createTestContext());
    auth = new FakeYouTubeAuthClient();
    channels = new InMemoryYouTubeChannelRepository();
    tokens = new InMemoryOAuthTokenStore<YouTubeChannelId>();
    outbox = new InMemoryOutbox();
    const persistence = new DomainPersistence(
      outbox,
      new ImmediateUnitOfWork(),
    );
    complete = new CompleteYouTubeAuthorizationUseCase(
      factory,
      channels,
      persistence,
      auth,
      tokens,
    );
    disconnect = new DisconnectYouTubeChannelUseCase(
      factory,
      channels,
      persistence,
      tokens,
    );
  });

  it('connects the channel and stores its token', async () => {
    const result = await complete.execute(INPUT);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toMatchObject({
      youtube_id: auth.authorization.profile.youtube_id,
      handle: '@ToxicToastTTV',
      connected: true,
    });
    expect(tokens.items.get(result.value.id)).toEqual(auth.authorization.token);
  });

  it('refuses a login without all scopes', async () => {
    auth.authorization = {
      ...auth.authorization,
      token: {
        ...auth.authorization.token,
        scopes: ['https://www.googleapis.com/auth/youtube.readonly'],
      },
    };

    const result = await complete.execute(INPUT);

    expect(result.isFailure).toBe(true);
    expect(result.error.message).toContain('youtube.upload');
    expect(tokens.items.size).toBe(0);
  });

  it('reconnects the same channel instead of creating a second one', async () => {
    const first = await complete.execute(INPUT);
    const second = await complete.execute(INPUT);

    expect(second.value.id).toBe(first.value.id);
    expect(channels.items.size).toBe(1);
  });

  it('disconnects and forgets the token', async () => {
    const connected = await complete.execute(INPUT);

    const result = await disconnect.execute({ id: connected.value.id });

    expect(result.value.connected).toBe(false);
    expect(tokens.items.size).toBe(0);
  });
});
