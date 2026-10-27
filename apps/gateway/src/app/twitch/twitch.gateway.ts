import type { OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  TWITCH_BOT_SERVICE_NAME,
  type CompleteAuthorizationRequest,
  type CompleteAuthorizationResponse,
  type DisconnectChannelResponse,
  type ListChannelsResponse,
  type StartAuthorizationRequest,
  type StartAuthorizationResponse,
  type TwitchBotServiceClient,
} from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { RequestMetadata } from '../grpc/services/index.js';

export class TwitchGateway implements OnModuleInit {
  private client: Nullable<TwitchBotServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: RequestMetadata,
  ) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<TwitchBotServiceClient>(
      TWITCH_BOT_SERVICE_NAME,
    );
  }

  startAuthorization(
    request: StartAuthorizationRequest,
  ): Observable<StartAuthorizationResponse> {
    return this.twitch().startAuthorization(request, this.metadata.current());
  }

  completeAuthorization(
    request: CompleteAuthorizationRequest,
  ): Observable<CompleteAuthorizationResponse> {
    return this.twitch().completeAuthorization(
      request,
      this.metadata.current(),
    );
  }

  listChannels(): Observable<ListChannelsResponse> {
    return this.twitch().listChannels({}, this.metadata.current());
  }

  disconnectChannel(id: string): Observable<DisconnectChannelResponse> {
    return this.twitch().disconnectChannel({ id }, this.metadata.current());
  }

  private twitch(): TwitchBotServiceClient {
    if (!this.client) {
      throw new Error('Twitch bot client is not initialized');
    }
    return this.client;
  }
}
