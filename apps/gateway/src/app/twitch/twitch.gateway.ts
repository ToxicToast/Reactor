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
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../grpc/abstracts/index.js';
import type { RequestMetadata } from '../grpc/services/index.js';

export class TwitchGateway extends GrpcGateway<TwitchBotServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, TWITCH_BOT_SERVICE_NAME, metadata);
  }

  startAuthorization(
    request: StartAuthorizationRequest,
  ): Observable<StartAuthorizationResponse> {
    return this.service.startAuthorization(request, this.metadata());
  }

  completeAuthorization(
    request: CompleteAuthorizationRequest,
  ): Observable<CompleteAuthorizationResponse> {
    return this.service.completeAuthorization(request, this.metadata());
  }

  listChannels(): Observable<ListChannelsResponse> {
    return this.service.listChannels({}, this.metadata());
  }

  disconnectChannel(id: string): Observable<DisconnectChannelResponse> {
    return this.service.disconnectChannel({ id }, this.metadata());
  }
}
