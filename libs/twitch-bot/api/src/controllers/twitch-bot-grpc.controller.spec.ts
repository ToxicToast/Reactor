import { status } from '@grpc/grpc-js';
import { DomainPersistence } from '@toxictoast/shared-application';
import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import {
  grpcCode,
  TestActorProvider,
  testActor,
} from '@toxictoast/shared-grpc/testing';
import {
  CompleteAuthorizationUseCase,
  DisconnectChannelUseCase,
  ListChannelsUseCase,
  StartAuthorizationUseCase,
  SyncChattersUseCase,
  SyncClipsUseCase,
  SyncFollowersUseCase,
  ImportMediaUseCase,
  SyncMediaUseCase,
  SyncVideosUseCase,
} from '@toxictoast/twitch-bot-application';
import {
  createTestContext,
  FakeTwitchAuthClient,
  FakeTwitchChatterSource,
  FakeTwitchClipSource,
  FakeTwitchFollowerSource,
  InMemoryChatterRepository,
  InMemoryFollowerRepository,
  InMemoryPublishedClipLedger,
  InMemoryTwitchChannelRepository,
  InMemoryTwitchTokenStore,
  RecordingTwitchEventSubscriber,
  twitchChannelAnemic,
  FakeTwitchVideoSource,
  InMemoryMediaImportLog,
  InMemoryPublishedLedger,
} from '@toxictoast/twitch-bot-application/testing';
import {
  ChatterDiffService,
  TwitchChannelFactory,
} from '@toxictoast/twitch-bot-domain';
import { TwitchBotGrpcController } from './twitch-bot-grpc.controller.js';

const CHANNEL_ID = '0192f3a0-0000-7000-8000-000000000c01';
const REDIRECT = 'http://localhost:4000/admin/twitch/callback';

describe('TwitchBotGrpcController', () => {
  let actors: TestActorProvider;
  let controller: TwitchBotGrpcController;

  beforeEach(async () => {
    const ctx = createTestContext();
    const channels = new InMemoryTwitchChannelRepository();
    const tokens = new InMemoryTwitchTokenStore();
    const subscriber = new RecordingTwitchEventSubscriber();
    const outbox = new InMemoryOutbox();
    const uow = new ImmediateUnitOfWork();
    const persistence = new DomainPersistence(outbox, uow);
    const factory = new TwitchChannelFactory(ctx);
    const auth = new FakeTwitchAuthClient();
    const clipSource = new FakeTwitchClipSource();
    const clipLedger = new InMemoryPublishedClipLedger();
    const videoSource = new FakeTwitchVideoSource();
    const videoLedger = new InMemoryPublishedLedger();
    const syncClips = new SyncClipsUseCase(
      channels,
      clipSource,
      clipLedger,
      outbox,
      uow,
      ctx,
    );

    await channels.save(twitchChannelAnemic(CHANNEL_ID, { twitch_id: '999' }));

    actors = new TestActorProvider(testActor(['twitch-bot.channel.manage']));
    controller = new TwitchBotGrpcController(
      new StartAuthorizationUseCase(auth),
      new CompleteAuthorizationUseCase(
        factory,
        channels,
        persistence,
        auth,
        tokens,
        subscriber,
      ),
      new ListChannelsUseCase(channels),
      new DisconnectChannelUseCase(
        factory,
        channels,
        persistence,
        tokens,
        subscriber,
      ),
      new SyncChattersUseCase(
        channels,
        new InMemoryChatterRepository(),
        new FakeTwitchChatterSource(),
        new ChatterDiffService(),
        outbox,
        uow,
        ctx,
      ),
      syncClips,
      new SyncFollowersUseCase(
        channels,
        new InMemoryFollowerRepository(),
        new FakeTwitchFollowerSource(),
        outbox,
        uow,
        ctx,
      ),
      new SyncMediaUseCase(
        new ImportMediaUseCase(
          channels,
          clipSource,
          videoSource,
          clipLedger,
          videoLedger,
          new InMemoryMediaImportLog(),
          outbox,
          uow,
          ctx,
        ),
        syncClips,
        new SyncVideosUseCase(
          channels,
          videoSource,
          videoLedger,
          outbox,
          uow,
          ctx,
        ),
      ),
      actors,
    );
  });

  it('starts the authorization', async () => {
    const response = await controller.startAuthorization({
      state: 'state-1',
      redirect_uri: REDIRECT,
    });

    expect(new URL(response.url).searchParams.get('state')).toBe('state-1');
  });

  it('completes the authorization and returns the channel', async () => {
    const response = await controller.completeAuthorization({
      code: 'code-1',
      redirect_uri: REDIRECT,
    });

    expect(response.channel).toMatchObject({
      twitch_id: '123456',
      login: 'toxictoast',
      connected: true,
    });
  });

  it('lists the channels', async () => {
    const response = await controller.listChannels();

    expect(response.channels).toEqual([
      expect.objectContaining({
        id: CHANNEL_ID,
        created_at: '2026-10-26T19:00:00.000Z',
      }),
    ]);
  });

  it('disconnects a channel', async () => {
    const response = await controller.disconnectChannel({ id: CHANNEL_ID });

    expect(response.channel?.connected).toBe(false);
  });

  it('refuses an id that is not a uuid', async () => {
    await expect(
      grpcCode(controller.disconnectChannel({ id: 'kaputt' })),
    ).resolves.toBe(status.INVALID_ARGUMENT);
  });

  it('requires the manage permission', async () => {
    actors.actor = testActor(['twitch-bot.sync']);

    await expect(grpcCode(controller.listChannels())).resolves.toBe(
      status.PERMISSION_DENIED,
    );
  });

  it('syncs with the sync permission only', async () => {
    await expect(grpcCode(controller.syncChatters())).resolves.toBe(
      status.PERMISSION_DENIED,
    );
    await expect(grpcCode(controller.syncFollowers())).resolves.toBe(
      status.PERMISSION_DENIED,
    );

    actors.actor = testActor(['twitch-bot.sync']);

    await expect(controller.syncChatters()).resolves.toEqual({
      joined: 0,
      left: 0,
    });
    await expect(controller.syncClips()).resolves.toEqual({ created: 0 });
    await expect(controller.syncFollowers()).resolves.toEqual({
      followed: 0,
      unfollowed: 0,
    });
    await expect(controller.syncMedia()).resolves.toEqual({
      imported_clips: 0,
      imported_videos: 0,
      created_clips: 0,
      created_videos: 0,
    });
  });
});
