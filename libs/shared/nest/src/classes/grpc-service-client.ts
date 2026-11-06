import type { ClientGrpc } from '@nestjs/microservices';
import type { Nullable } from '@toxictoast/shared-types';

export class GrpcServiceClient<TClient extends object> {
  private client: Nullable<TClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly serviceName: string,
  ) {}

  get service(): TClient {
    if (!this.client) {
      this.client = this.grpc.getService<TClient>(this.serviceName);
    }
    return this.client;
  }
}
