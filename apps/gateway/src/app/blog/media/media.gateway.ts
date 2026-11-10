import type { ClientGrpc } from '@nestjs/microservices';
import {
  MEDIA_SERVICE_NAME,
  type ConfirmMediaUploadResponse,
  type DeleteMediaResponse,
  type GetMediaRequest,
  type GetMediaResponse,
  type GetMediaUrlResponse,
  type ListMediaRequest,
  type ListMediaResponse,
  type MediaServiceClient,
  type RequestMediaUploadRequest,
  type RequestMediaUploadResponse,
  type RestoreMediaResponse,
  type UpdateMediaAltTextRequest,
  type UpdateMediaAltTextResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../../grpc/abstracts/index.js';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class MediaGateway extends GrpcGateway<MediaServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, MEDIA_SERVICE_NAME, metadata);
  }

  requestUpload(
    request: RequestMediaUploadRequest,
  ): Observable<RequestMediaUploadResponse> {
    return this.service.requestMediaUpload(request, this.metadata());
  }

  confirmUpload(id: string): Observable<ConfirmMediaUploadResponse> {
    return this.service.confirmMediaUpload({ id }, this.metadata());
  }

  updateAltText(
    request: UpdateMediaAltTextRequest,
  ): Observable<UpdateMediaAltTextResponse> {
    return this.service.updateMediaAltText(request, this.metadata());
  }

  delete(id: string): Observable<DeleteMediaResponse> {
    return this.service.deleteMedia({ id }, this.metadata());
  }

  restore(id: string): Observable<RestoreMediaResponse> {
    return this.service.restoreMedia({ id }, this.metadata());
  }

  get(request: GetMediaRequest): Observable<GetMediaResponse> {
    return this.service.getMedia(request, this.metadata());
  }

  getUrl(id: string): Observable<GetMediaUrlResponse> {
    return this.service.getMediaUrl({ id }, this.metadata());
  }

  list(request: ListMediaRequest): Observable<ListMediaResponse> {
    return this.service.listMedia(request, this.metadata());
  }
}
