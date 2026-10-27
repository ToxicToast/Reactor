import type { OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  BAN_SERVICE_NAME,
  type BanServiceClient,
  type ListBansRequest,
  type ListBansResponse,
  type UnbanIpResponse,
} from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class BanGateway implements OnModuleInit {
  private client: Nullable<BanServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: RequestMetadata,
  ) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<BanServiceClient>(BAN_SERVICE_NAME);
  }

  list(request: ListBansRequest): Observable<ListBansResponse> {
    return this.bans().listBans(request, this.metadata.current());
  }

  unban(ip: string): Observable<UnbanIpResponse> {
    return this.bans().unbanIp({ ip }, this.metadata.current());
  }

  private bans(): BanServiceClient {
    if (!this.client) {
      throw new Error('Security ban client is not initialized');
    }
    return this.client;
  }
}
