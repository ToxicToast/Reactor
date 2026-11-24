import { Controller } from '@nestjs/common';
import {
  TwitchBotPermission,
  TwitchBotServiceControllerMethods,
  type AddFriendRequest,
  type AddFriendResponse,
  type CompleteAuthorizationRequest,
  type CompleteAuthorizationResponse,
  type DisconnectChannelRequest,
  type DisconnectChannelResponse,
  type ListChannelsResponse,
  type ListFriendsResponse,
  type RemoveFriendRequest,
  type RemoveFriendResponse,
  type StartAuthorizationRequest,
  type StartAuthorizationResponse,
  type SyncChattersResponse,
  type SyncClipsResponse,
  type SyncFollowersResponse,
  type TwitchBotServiceController,
  type SyncMediaResponse,
  type SyncStreamsResponse,
  type SyncFollowerCountsResponse,
} from '@toxictoast/contracts-grpc';
import { parseId, requirePermission, unwrap } from '@toxictoast/shared-grpc';
import { ActorProvider } from '@toxictoast/shared-kernel';
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
  SyncFollowerCountsUseCase,
  SyncFollowersUseCase,
  SyncMediaUseCase,
  SyncStreamsUseCase,
} from '@toxictoast/twitch-bot-application';
import {
  TwitchChannelGrpcMapper,
  TwitchFriendGrpcMapper,
} from '../mappers/index.js';

@Controller()
@TwitchBotServiceControllerMethods()
export class TwitchBotGrpcController implements TwitchBotServiceController {
  private readonly mapper = new TwitchChannelGrpcMapper();
  private readonly friendMapper = new TwitchFriendGrpcMapper();

  constructor(
    private readonly startAuthorizationUseCase: StartAuthorizationUseCase,
    private readonly completeAuthorizationUseCase: CompleteAuthorizationUseCase,
    private readonly listChannelsUseCase: ListChannelsUseCase,
    private readonly disconnectChannelUseCase: DisconnectChannelUseCase,
    private readonly syncChattersUseCase: SyncChattersUseCase,
    private readonly syncClipsUseCase: SyncClipsUseCase,
    private readonly syncFollowersUseCase: SyncFollowersUseCase,
    private readonly syncMediaUseCase: SyncMediaUseCase,
    private readonly listFriendsUseCase: ListFriendsUseCase,
    private readonly addFriendUseCase: AddFriendUseCase,
    private readonly removeFriendUseCase: RemoveFriendUseCase,
    private readonly syncStreamsUseCase: SyncStreamsUseCase,
    private readonly syncFollowerCountsUseCase: SyncFollowerCountsUseCase,
    private readonly actors: ActorProvider,
  ) {}

  async startAuthorization(
    request: StartAuthorizationRequest,
  ): Promise<StartAuthorizationResponse> {
    requirePermission(
      this.actors.current(),
      TwitchBotPermission.CHANNEL_MANAGE,
    );
    return unwrap(
      await this.startAuthorizationUseCase.execute({
        state: request.state,
        redirect_uri: request.redirect_uri,
      }),
    );
  }

  async completeAuthorization(
    request: CompleteAuthorizationRequest,
  ): Promise<CompleteAuthorizationResponse> {
    requirePermission(
      this.actors.current(),
      TwitchBotPermission.CHANNEL_MANAGE,
    );
    const channel = unwrap(
      await this.completeAuthorizationUseCase.execute({
        code: request.code,
        redirect_uri: request.redirect_uri,
      }),
    );
    return { channel: this.mapper.toProto(channel) };
  }

  async listChannels(): Promise<ListChannelsResponse> {
    requirePermission(
      this.actors.current(),
      TwitchBotPermission.CHANNEL_MANAGE,
    );
    const channels = unwrap(await this.listChannelsUseCase.execute());
    return {
      channels: channels.map((channel) => this.mapper.toProto(channel)),
    };
  }

  async disconnectChannel(
    request: DisconnectChannelRequest,
  ): Promise<DisconnectChannelResponse> {
    requirePermission(
      this.actors.current(),
      TwitchBotPermission.CHANNEL_MANAGE,
    );
    const channel = unwrap(
      await this.disconnectChannelUseCase.execute({
        id: parseId<'TwitchChannel'>(request.id),
      }),
    );
    return { channel: this.mapper.toProto(channel) };
  }

  async syncChatters(): Promise<SyncChattersResponse> {
    requirePermission(this.actors.current(), TwitchBotPermission.SYNC);
    return unwrap(await this.syncChattersUseCase.execute());
  }

  async syncClips(): Promise<SyncClipsResponse> {
    requirePermission(this.actors.current(), TwitchBotPermission.SYNC);
    return unwrap(await this.syncClipsUseCase.execute());
  }

  async syncFollowers(): Promise<SyncFollowersResponse> {
    requirePermission(this.actors.current(), TwitchBotPermission.SYNC);
    return unwrap(await this.syncFollowersUseCase.execute());
  }

  async syncMedia(): Promise<SyncMediaResponse> {
    requirePermission(this.actors.current(), TwitchBotPermission.SYNC);
    return unwrap(await this.syncMediaUseCase.execute());
  }

  async syncStreams(): Promise<SyncStreamsResponse> {
    requirePermission(this.actors.current(), TwitchBotPermission.SYNC);
    return unwrap(await this.syncStreamsUseCase.execute());
  }

  async syncFollowerCounts(): Promise<SyncFollowerCountsResponse> {
    requirePermission(this.actors.current(), TwitchBotPermission.SYNC);
    return unwrap(await this.syncFollowerCountsUseCase.execute());
  }

  async listFriends(): Promise<ListFriendsResponse> {
    requirePermission(
      this.actors.current(),
      TwitchBotPermission.CHANNEL_MANAGE,
    );
    const friends = unwrap(await this.listFriendsUseCase.execute());
    return {
      friends: friends.map((friend) => this.friendMapper.toProto(friend)),
    };
  }

  async addFriend(request: AddFriendRequest): Promise<AddFriendResponse> {
    requirePermission(
      this.actors.current(),
      TwitchBotPermission.CHANNEL_MANAGE,
    );
    const friend = unwrap(
      await this.addFriendUseCase.execute({ login: request.login }),
    );
    return { friend: this.friendMapper.toProto(friend) };
  }

  async removeFriend(
    request: RemoveFriendRequest,
  ): Promise<RemoveFriendResponse> {
    requirePermission(
      this.actors.current(),
      TwitchBotPermission.CHANNEL_MANAGE,
    );
    const friend = unwrap(
      await this.removeFriendUseCase.execute({
        id: parseId<'TwitchFriend'>(request.id),
      }),
    );
    return { friend: this.friendMapper.toProto(friend) };
  }
}
