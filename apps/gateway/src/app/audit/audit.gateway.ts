import type { OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  AUDIT_SERVICE_NAME,
  type AuditServiceClient,
  type ListEventsRequest,
  type ListEventsResponse,
} from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { RequestMetadata } from '../grpc/services/index.js';

export class AuditGateway implements OnModuleInit {
  private client: Nullable<AuditServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: RequestMetadata,
  ) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<AuditServiceClient>(AUDIT_SERVICE_NAME);
  }

  list(request: ListEventsRequest): Observable<ListEventsResponse> {
    return this.audit().listEvents(request, this.metadata.current());
  }

  private audit(): AuditServiceClient {
    if (!this.client) {
      throw new Error('Audit client is not initialized');
    }
    return this.client;
  }
}
