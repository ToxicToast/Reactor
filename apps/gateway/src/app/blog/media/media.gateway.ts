import type { OnModuleInit } from '@nestjs/common';
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
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { ActorMetadata } from '../../grpc/services/index.js';

export class MediaGateway implements OnModuleInit {
  private client: Nullable<MediaServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: ActorMetadata,
  ) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<MediaServiceClient>(MEDIA_SERVICE_NAME);
  }

  requestUpload(
    request: RequestMediaUploadRequest,
  ): Observable<RequestMediaUploadResponse> {
    return this.media().requestMediaUpload(request, this.metadata.current());
  }

  confirmUpload(id: string): Observable<ConfirmMediaUploadResponse> {
    return this.media().confirmMediaUpload({ id }, this.metadata.current());
  }

  updateAltText(
    request: UpdateMediaAltTextRequest,
  ): Observable<UpdateMediaAltTextResponse> {
    return this.media().updateMediaAltText(request, this.metadata.current());
  }

  delete(id: string): Observable<DeleteMediaResponse> {
    return this.media().deleteMedia({ id }, this.metadata.current());
  }

  restore(id: string): Observable<RestoreMediaResponse> {
    return this.media().restoreMedia({ id }, this.metadata.current());
  }

  get(request: GetMediaRequest): Observable<GetMediaResponse> {
    return this.media().getMedia(request, this.metadata.current());
  }

  getUrl(id: string): Observable<GetMediaUrlResponse> {
    return this.media().getMediaUrl({ id }, this.metadata.current());
  }

  list(request: ListMediaRequest): Observable<ListMediaResponse> {
    return this.media().listMedia(request, this.metadata.current());
  }

  private media(): MediaServiceClient {
    if (!this.client) {
      throw new Error('Blog media client is not initialized');
    }
    return this.client;
  }
}
