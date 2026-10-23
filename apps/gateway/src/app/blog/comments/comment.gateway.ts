import type { OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  COMMENT_SERVICE_NAME,
  type CommentServiceClient,
  type CreateCommentRequest,
  type CreateCommentResponse,
  type DeleteCommentResponse,
  type GetCommentRequest,
  type GetCommentResponse,
  type ListCommentsByStatusRequest,
  type ListCommentsByStatusResponse,
  type ListPostCommentsResponse,
  type ModerateCommentRequest,
  type ModerateCommentResponse,
  type RestoreCommentResponse,
  type UpdateCommentRequest,
  type UpdateCommentResponse,
} from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { ActorMetadata } from '../../grpc/services/index.js';

export class CommentGateway implements OnModuleInit {
  private client: Nullable<CommentServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: ActorMetadata,
  ) {}

  onModuleInit(): void {
    this.client =
      this.grpc.getService<CommentServiceClient>(COMMENT_SERVICE_NAME);
  }

  create(request: CreateCommentRequest): Observable<CreateCommentResponse> {
    return this.comments().createComment(request, this.metadata.current());
  }

  update(request: UpdateCommentRequest): Observable<UpdateCommentResponse> {
    return this.comments().updateComment(request, this.metadata.current());
  }

  moderate(
    request: ModerateCommentRequest,
  ): Observable<ModerateCommentResponse> {
    return this.comments().moderateComment(request, this.metadata.current());
  }

  delete(id: string): Observable<DeleteCommentResponse> {
    return this.comments().deleteComment({ id }, this.metadata.current());
  }

  restore(id: string): Observable<RestoreCommentResponse> {
    return this.comments().restoreComment({ id }, this.metadata.current());
  }

  get(request: GetCommentRequest): Observable<GetCommentResponse> {
    return this.comments().getComment(request, this.metadata.current());
  }

  listForPost(postId: string): Observable<ListPostCommentsResponse> {
    return this.comments().listPostComments(
      { post_id: postId },
      this.metadata.current(),
    );
  }

  listByStatus(
    request: ListCommentsByStatusRequest,
  ): Observable<ListCommentsByStatusResponse> {
    return this.comments().listCommentsByStatus(
      request,
      this.metadata.current(),
    );
  }

  private comments(): CommentServiceClient {
    if (!this.client) {
      throw new Error('Blog comment client is not initialized');
    }
    return this.client;
  }
}
