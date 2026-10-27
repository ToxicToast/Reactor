import { Controller } from '@nestjs/common';
import {
  TwitchBotPermission,
  TwitchBotServiceControllerMethods,
  type CompleteAuthorizationRequest,
  type CompleteAuthorizationResponse,
  type DisconnectChannelRequest,
  type DisconnectChannelResponse,
  type ListChannelsResponse,
  type StartAuthorizationRequest,
  type StartAuthorizationResponse,
  type SyncChattersResponse,
  type SyncClipsResponse,
  type TwitchBotServiceController,
} from '@toxictoast/contracts-grpc';
import { parseId, requirePermission, unwrap } from '@toxictoast/shared-grpc';
import { ActorProvider } from '@toxictoast/shared-kernel';
import {
  CompleteAuthorizationUseCase,
  DisconnectChannelUseCase,
  ListChannelsUseCase,
  StartAuthorizationUseCase,
  SyncChattersUseCase,
  SyncClipsUseCase,
} from '@toxictoast/twitch-bot-application';
import { TwitchChannelGrpcMapper } from '../mappers/index.js';

@Controller()
@TwitchBotServiceControllerMethods()
export class TwitchBotGrpcController implements TwitchBotServiceController {
  private readonly mapper = new TwitchChannelGrpcMapper();

  constructor(
    private readonly startAuthorizationUseCase: StartAuthorizationUseCase,
    private readonly completeAuthorizationUseCase: CompleteAuthorizationUseCase,
    private readonly listChannelsUseCase: ListChannelsUseCase,
    private readonly disconnectChannelUseCase: DisconnectChannelUseCase,
    private readonly syncChattersUseCase: SyncChattersUseCase,
    private readonly syncClipsUseCase: SyncClipsUseCase,
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
}
