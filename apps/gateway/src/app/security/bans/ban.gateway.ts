import type { ClientGrpc } from '@nestjs/microservices';
import {
  BAN_SERVICE_NAME,
  type BanServiceClient,
  type ListBansRequest,
  type ListBansResponse,
  type UnbanIpResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../../grpc/abstracts/index.js';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class BanGateway extends GrpcGateway<BanServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, BAN_SERVICE_NAME, metadata);
  }

  list(request: ListBansRequest): Observable<ListBansResponse> {
    return this.service.listBans(request, this.metadata());
  }

  unban(ip: string): Observable<UnbanIpResponse> {
    return this.service.unbanIp({ ip }, this.metadata());
  }
}
