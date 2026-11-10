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
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../../grpc/abstracts/index.js';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class CommentGateway extends GrpcGateway<CommentServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, COMMENT_SERVICE_NAME, metadata);
  }

  create(request: CreateCommentRequest): Observable<CreateCommentResponse> {
    return this.service.createComment(request, this.metadata());
  }

  update(request: UpdateCommentRequest): Observable<UpdateCommentResponse> {
    return this.service.updateComment(request, this.metadata());
  }

  moderate(
    request: ModerateCommentRequest,
  ): Observable<ModerateCommentResponse> {
    return this.service.moderateComment(request, this.metadata());
  }

  delete(id: string): Observable<DeleteCommentResponse> {
    return this.service.deleteComment({ id }, this.metadata());
  }

  restore(id: string): Observable<RestoreCommentResponse> {
    return this.service.restoreComment({ id }, this.metadata());
  }

  get(request: GetCommentRequest): Observable<GetCommentResponse> {
    return this.service.getComment(request, this.metadata());
  }

  listForPost(postId: string): Observable<ListPostCommentsResponse> {
    return this.service.listPostComments({ post_id: postId }, this.metadata());
  }

  listByStatus(
    request: ListCommentsByStatusRequest,
  ): Observable<ListCommentsByStatusResponse> {
    return this.service.listCommentsByStatus(request, this.metadata());
  }
}
