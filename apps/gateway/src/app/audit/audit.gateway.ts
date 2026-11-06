import type { ClientGrpc } from '@nestjs/microservices';
import {
  AUDIT_SERVICE_NAME,
  type AuditServiceClient,
  type ListEventsRequest,
  type ListEventsResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../grpc/abstracts/index.js';
import type { RequestMetadata } from '../grpc/services/index.js';

export class AuditGateway extends GrpcGateway<AuditServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, AUDIT_SERVICE_NAME, metadata);
  }

  list(request: ListEventsRequest): Observable<ListEventsResponse> {
    return this.service.listEvents(request, this.metadata());
  }
}
