import type { OnModuleInit } from '@nestjs/common';
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
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class TagGateway implements OnModuleInit {
  private client: Nullable<TagServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: RequestMetadata,
  ) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<TagServiceClient>(TAG_SERVICE_NAME);
  }

  create(request: CreateTagRequest): Observable<CreateTagResponse> {
    return this.tags().createTag(request, this.metadata.current());
  }

  update(request: UpdateTagRequest): Observable<UpdateTagResponse> {
    return this.tags().updateTag(request, this.metadata.current());
  }

  delete(id: string): Observable<DeleteTagResponse> {
    return this.tags().deleteTag({ id }, this.metadata.current());
  }

  restore(id: string): Observable<RestoreTagResponse> {
    return this.tags().restoreTag({ id }, this.metadata.current());
  }

  get(request: GetTagRequest): Observable<GetTagResponse> {
    return this.tags().getTag(request, this.metadata.current());
  }

  list(request: ListTagsRequest): Observable<ListTagsResponse> {
    return this.tags().listTags(request, this.metadata.current());
  }

  private tags(): TagServiceClient {
    if (!this.client) {
      throw new Error('Blog tag client is not initialized');
    }
    return this.client;
  }
}
