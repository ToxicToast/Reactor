import type { Metadata } from '@grpc/grpc-js';
import type { ClientGrpc } from '@nestjs/microservices';
import { GrpcServiceClient } from '@toxictoast/shared-nest';
import type { RequestMetadata } from '../services/index.js';

export abstract class GrpcGateway<TClient extends object> {
  private readonly client: GrpcServiceClient<TClient>;

  protected constructor(
    grpc: ClientGrpc,
    serviceName: string,
    private readonly requestMetadata: RequestMetadata,
  ) {
    this.client = new GrpcServiceClient<TClient>(grpc, serviceName);
  }

  protected get service(): TClient {
    return this.client.service;
  }

  protected metadata(): Metadata {
    return this.requestMetadata.current();
  }
}
