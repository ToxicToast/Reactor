import type { ClientGrpc } from '@nestjs/microservices';
import {
  TAG_SERVICE_NAME,
  type CreateTagRequest,
  type CreateTagResponse,
  type DeleteTagResponse,
  type GetTagRequest,
  type GetTagResponse,
  type ListTagsRequest,
  type ListTagsResponse,
  type RestoreTagResponse,
  type TagServiceClient,
  type UpdateTagRequest,
  type UpdateTagResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../../grpc/abstracts/index.js';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class TagGateway extends GrpcGateway<TagServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, TAG_SERVICE_NAME, metadata);
  }

  create(request: CreateTagRequest): Observable<CreateTagResponse> {
    return this.service.createTag(request, this.metadata());
  }

  update(request: UpdateTagRequest): Observable<UpdateTagResponse> {
    return this.service.updateTag(request, this.metadata());
  }

  delete(id: string): Observable<DeleteTagResponse> {
    return this.service.deleteTag({ id }, this.metadata());
  }

  restore(id: string): Observable<RestoreTagResponse> {
    return this.service.restoreTag({ id }, this.metadata());
  }

  get(request: GetTagRequest): Observable<GetTagResponse> {
    return this.service.getTag(request, this.metadata());
  }

  list(request: ListTagsRequest): Observable<ListTagsResponse> {
    return this.service.listTags(request, this.metadata());
  }
}
