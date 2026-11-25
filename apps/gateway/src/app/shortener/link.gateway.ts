import type { ClientGrpc } from '@nestjs/microservices';
import {
  LINK_SERVICE_NAME,
  type CreateLinkRequest,
  type CreateLinkResponse,
  type DeleteLinkResponse,
  type GetLinkRequest,
  type GetLinkResponse,
  type GetLinkStatsRequest,
  type GetLinkStatsResponse,
  type LinkServiceClient,
  type ListLinksRequest,
  type ListLinksResponse,
  type ResolveLinkResponse,
  type RestoreLinkResponse,
  type UpdateLinkRequest,
  type UpdateLinkResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../grpc/abstracts/index.js';
import type { RequestMetadata } from '../grpc/services/index.js';

export class LinkGateway extends GrpcGateway<LinkServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, LINK_SERVICE_NAME, metadata);
  }

  create(request: CreateLinkRequest): Observable<CreateLinkResponse> {
    return this.service.createLink(request, this.metadata());
  }

  update(request: UpdateLinkRequest): Observable<UpdateLinkResponse> {
    return this.service.updateLink(request, this.metadata());
  }

  delete(id: string): Observable<DeleteLinkResponse> {
    return this.service.deleteLink({ id }, this.metadata());
  }

  restore(id: string): Observable<RestoreLinkResponse> {
    return this.service.restoreLink({ id }, this.metadata());
  }

  get(request: GetLinkRequest): Observable<GetLinkResponse> {
    return this.service.getLink(request, this.metadata());
  }

  list(request: ListLinksRequest): Observable<ListLinksResponse> {
    return this.service.listLinks(request, this.metadata());
  }

  resolve(id: string): Observable<ResolveLinkResponse> {
    return this.service.resolveLink({ id }, this.metadata());
  }

  stats(request: GetLinkStatsRequest): Observable<GetLinkStatsResponse> {
    return this.service.getLinkStats(request, this.metadata());
  }
}
