import { status } from '@grpc/grpc-js';
import { DomainPersistence } from '@toxictoast/shared-application';
import {
  ImmediateUnitOfWork,
  InMemoryOutbox,
} from '@toxictoast/shared-application/testing';
import { createFixedTestContext } from '@toxictoast/shared-kernel/testing';
import {
  grpcCode,
  TestActorProvider,
  testActor,
} from '@toxictoast/shared-grpc/testing';
import {
  AddFriendUseCase,
  CompleteAuthorizationUseCase,
  DisconnectChannelUseCase,
  ListChannelsUseCase,
  ListFriendsUseCase,
  RemoveFriendUseCase,
  StartAuthorizationUseCase,
  SyncChattersUseCase,
  SyncClipsUseCase,
  SyncFollowersUseCase,
  ImportMediaUseCase,
  SyncMediaUseCase,
  SyncVideosUseCase,
  TrackedChannels,
} from '@toxictoast/twitch-bot-application';
import {
  createTestContext,
  FakeTwitchAuthClient,
  FakeTwitchChatterSource,
  FakeTwitchClipSource,
  FakeTwitchFollowerSource,
  FakeTwitchUserLookup,
  InMemoryChatterRepository,
  InMemoryFollowerRepository,
  InMemoryPublishedClipLedger,
  InMemoryTwitchChannelRepository,
  InMemoryTwitchFriendRepository,
  InMemoryTwitchTokenStore,
  RecordingTwitchEventSubscriber,
  twitchChannelAnemic,
  FakeTwitchVideoSource,
  InMemoryMediaImportLog,
  InMemoryPublishedLedger,
  TEST_NOW,
} from '@toxictoast/twitch-bot-application/testing';
import {
  ChatterDiffService,
  TwitchChannelFactory,
  TwitchFriendFactory,
} from '@toxictoast/twitch-bot-domain';
import { TwitchBotGrpcController } from './twitch-bot-grpc.controller.js';

const CHANNEL_ID = '0192f3a0-0000-7000-8000-000000000c01';
const FRIEND_ID = '0192f3a0-0000-7000-8000-000000000f01';
const REDIRECT = 'http://localhost:4000/admin/twitch/callback';

describe('TwitchBotGrpcController', () => {
  let actors: TestActorProvider;
  let controller: TwitchBotGrpcController;

  beforeEach(async () => {
    const ctx = createTestContext();
    const channels = new InMemoryTwitchChannelRepository();
    const friends = new InMemoryTwitchFriendRepository();
    const tracked = new TrackedChannels(channels, friends);
    const tokens = new InMemoryTwitchTokenStore();
    const subscriber = new RecordingTwitchEventSubscriber();
    const outbox = new InMemoryOutbox();
    const uow = new ImmediateUnitOfWork();
    const persistence = new DomainPersistence(outbox, uow);
    const factory = new TwitchChannelFactory(ctx);
    const friendFactory = new TwitchFriendFactory(
      createFixedTestContext(FRIEND_ID, () => TEST_NOW),
    );
    const auth = new FakeTwitchAuthClient();
    const users = new FakeTwitchUserLookup();
    const clipSource = new FakeTwitchClipSource();
    const clipLedger = new InMemoryPublishedClipLedger();
    const videoSource = new FakeTwitchVideoSource();
    const videoLedger = new InMemoryPublishedLedger();
    const syncClips = new SyncClipsUseCase(
      tracked,
      clipSource,
      clipLedger,
      outbox,
      uow,
      ctx,
    );

    users.users = [
      {
        twitch_id: '987654',
        login: 'maybeitsvero',
        display_name: 'Maybeitsvero',
      },
    ];
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
          tracked,
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
          tracked,
          videoSource,
          videoLedger,
          outbox,
          uow,
          ctx,
        ),
      ),
      new ListFriendsUseCase(friends),
      new AddFriendUseCase(
        friendFactory,
        friends,
        channels,
        persistence,
        users,
      ),
      new RemoveFriendUseCase(friendFactory, friends, persistence),
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

  it('adds, lists and removes a friend', async () => {
    const added = await controller.addFriend({ login: 'MaybeItsVero' });

    expect(added.friend).toMatchObject({
      id: FRIEND_ID,
      twitch_id: '987654',
      login: 'maybeitsvero',
    });
    expect((await controller.listFriends()).friends).toHaveLength(1);

    await controller.removeFriend({ id: FRIEND_ID });

    expect((await controller.listFriends()).friends).toHaveLength(0);
  });

  it('requires the manage permission for friends', async () => {
    actors.actor = testActor(['twitch-bot.sync']);

    await expect(
      grpcCode(controller.addFriend({ login: 'maybeitsvero' })),
    ).resolves.toBe(status.PERMISSION_DENIED);
  });
});
