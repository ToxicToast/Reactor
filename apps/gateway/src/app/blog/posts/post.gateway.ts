import type { ClientGrpc } from '@nestjs/microservices';
import {
  POST_SERVICE_NAME,
  type ArchivePostResponse,
  type CreatePostRequest,
  type CreatePostResponse,
  type DeletePostResponse,
  type GetPostRequest,
  type GetPostResponse,
  type GetPublishedPostResponse,
  type ListPostsRequest,
  type ListPostsResponse,
  type PostServiceClient,
  type PublishPostRequest,
  type PublishPostResponse,
  type RestorePostResponse,
  type UnarchivePostResponse,
  type UpdatePostRequest,
  type UpdatePostResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../../grpc/abstracts/index.js';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class PostGateway extends GrpcGateway<PostServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, POST_SERVICE_NAME, metadata);
  }

  create(request: CreatePostRequest): Observable<CreatePostResponse> {
    return this.service.createPost(request, this.metadata());
  }

  update(request: UpdatePostRequest): Observable<UpdatePostResponse> {
    return this.service.updatePost(request, this.metadata());
  }

  publish(request: PublishPostRequest): Observable<PublishPostResponse> {
    return this.service.publishPost(request, this.metadata());
  }

  archive(id: string): Observable<ArchivePostResponse> {
    return this.service.archivePost({ id }, this.metadata());
  }

  unarchive(id: string): Observable<UnarchivePostResponse> {
    return this.service.unarchivePost({ id }, this.metadata());
  }

  delete(id: string): Observable<DeletePostResponse> {
    return this.service.deletePost({ id }, this.metadata());
  }

  restore(id: string): Observable<RestorePostResponse> {
    return this.service.restorePost({ id }, this.metadata());
  }

  get(request: GetPostRequest): Observable<GetPostResponse> {
    return this.service.getPost(request, this.metadata());
  }

  getPublished(slug: string): Observable<GetPublishedPostResponse> {
    return this.service.getPublishedPost({ slug }, this.metadata());
  }

  list(request: ListPostsRequest): Observable<ListPostsResponse> {
    return this.service.listPosts(request, this.metadata());
  }
}
