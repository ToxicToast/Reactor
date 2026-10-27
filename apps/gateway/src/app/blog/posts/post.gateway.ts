import type { OnModuleInit } from '@nestjs/common';
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
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class PostGateway implements OnModuleInit {
  private client: Nullable<PostServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: RequestMetadata,
  ) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<PostServiceClient>(POST_SERVICE_NAME);
  }

  create(request: CreatePostRequest): Observable<CreatePostResponse> {
    return this.posts().createPost(request, this.metadata.current());
  }

  update(request: UpdatePostRequest): Observable<UpdatePostResponse> {
    return this.posts().updatePost(request, this.metadata.current());
  }

  publish(request: PublishPostRequest): Observable<PublishPostResponse> {
    return this.posts().publishPost(request, this.metadata.current());
  }

  archive(id: string): Observable<ArchivePostResponse> {
    return this.posts().archivePost({ id }, this.metadata.current());
  }

  unarchive(id: string): Observable<UnarchivePostResponse> {
    return this.posts().unarchivePost({ id }, this.metadata.current());
  }

  delete(id: string): Observable<DeletePostResponse> {
    return this.posts().deletePost({ id }, this.metadata.current());
  }

  restore(id: string): Observable<RestorePostResponse> {
    return this.posts().restorePost({ id }, this.metadata.current());
  }

  get(request: GetPostRequest): Observable<GetPostResponse> {
    return this.posts().getPost(request, this.metadata.current());
  }

  getPublished(slug: string): Observable<GetPublishedPostResponse> {
    return this.posts().getPublishedPost({ slug }, this.metadata.current());
  }

  list(request: ListPostsRequest): Observable<ListPostsResponse> {
    return this.posts().listPosts(request, this.metadata.current());
  }

  private posts(): PostServiceClient {
    if (!this.client) {
      throw new Error('Blog post client is not initialized');
    }
    return this.client;
  }
}
