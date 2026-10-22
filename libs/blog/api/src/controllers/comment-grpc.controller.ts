import { Controller } from '@nestjs/common';
import { ActorProvider } from '@toxictoast/shared-kernel';
import {
  CreateCommentUseCase,
  DeleteCommentUseCase,
  GetCommentUseCase,
  ListCommentsByStatusUseCase,
  ListPostCommentsUseCase,
  ModerateCommentUseCase,
  RestoreCommentUseCase,
  UpdateCommentUseCase,
} from '@toxictoast/blog-application';
import {
  CommentServiceControllerMethods,
  type CommentServiceController,
  type CreateCommentRequest,
  type CreateCommentResponse,
  type DeleteCommentRequest,
  type DeleteCommentResponse,
  type GetCommentRequest,
  type GetCommentResponse,
  type ListCommentsByStatusRequest,
  type ListCommentsByStatusResponse,
  type ListPostCommentsRequest,
  type ListPostCommentsResponse,
  type ModerateCommentRequest,
  type ModerateCommentResponse,
  type RestoreCommentRequest,
  type RestoreCommentResponse,
  type UpdateCommentRequest,
  type UpdateCommentResponse,
  BlogPermission,
} from '@toxictoast/contracts-grpc';
import {
  hasPermission,
  mapEnum,
  parseId,
  parseOptionalId,
  requirePermission,
  unwrap,
} from '@toxictoast/shared-grpc';
import { CommentGrpcMapper } from '../mappers/index.js';
import {
  COMMENT_STATUS_FROM_GRPC,
  MODERATION_STATUS_FROM_GRPC,
} from '../mappings/index.js';

@Controller()
@CommentServiceControllerMethods()
export class CommentGrpcController implements CommentServiceController {
  private readonly mapper = new CommentGrpcMapper();

  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly moderateCommentUseCase: ModerateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    private readonly restoreCommentUseCase: RestoreCommentUseCase,
    private readonly getCommentUseCase: GetCommentUseCase,
    private readonly listPostCommentsUseCase: ListPostCommentsUseCase,
    private readonly listCommentsByStatusUseCase: ListCommentsByStatusUseCase,
    private readonly actors: ActorProvider,
  ) {}

  async createComment(
    request: CreateCommentRequest,
  ): Promise<CreateCommentResponse> {
    const comment = unwrap(
      await this.createCommentUseCase.execute({
        post_id: parseId(request.post_id, 'post_id'),
        parent_id: parseOptionalId(request.parent_id, 'parent_id'),
        author_id: requirePermission(
          this.actors.current(),
          BlogPermission.COMMENT_WRITE,
        ),
        content: request.content,
      }),
    );
    return { comment: this.mapper.toProto(comment) };
  }

  async updateComment(
    request: UpdateCommentRequest,
  ): Promise<UpdateCommentResponse> {
    const comment = unwrap(
      await this.updateCommentUseCase.execute({
        id: parseId(request.id),
        content: request.content,
        author_id: requirePermission(
          this.actors.current(),
          BlogPermission.COMMENT_WRITE,
        ),
      }),
    );
    return { comment: this.mapper.toProto(comment) };
  }

  async moderateComment(
    request: ModerateCommentRequest,
  ): Promise<ModerateCommentResponse> {
    requirePermission(this.actors.current(), BlogPermission.COMMENT_MODERATE);
    const comment = unwrap(
      await this.moderateCommentUseCase.execute({
        id: parseId(request.id),
        status: mapEnum(MODERATION_STATUS_FROM_GRPC, request.status, 'status'),
        note: request.note ?? null,
      }),
    );
    return { comment: this.mapper.toProto(comment) };
  }

  async deleteComment(
    request: DeleteCommentRequest,
  ): Promise<DeleteCommentResponse> {
    requirePermission(this.actors.current(), BlogPermission.COMMENT_DELETE);
    const comment = unwrap(
      await this.deleteCommentUseCase.execute({ id: parseId(request.id) }),
    );
    return { comment: this.mapper.toProto(comment) };
  }

  async restoreComment(
    request: RestoreCommentRequest,
  ): Promise<RestoreCommentResponse> {
    requirePermission(this.actors.current(), BlogPermission.COMMENT_DELETE);
    const comment = unwrap(
      await this.restoreCommentUseCase.execute({ id: parseId(request.id) }),
    );
    return { comment: this.mapper.toProto(comment) };
  }

  async getComment(request: GetCommentRequest): Promise<GetCommentResponse> {
    const actor = this.actors.current();
    const comment = unwrap(
      await this.getCommentUseCase.execute({
        id: parseId(request.id),
        withDeleted:
          request.with_deleted &&
          hasPermission(actor, BlogPermission.COMMENT_DELETE),
        approvedOnly: !hasPermission(actor, BlogPermission.COMMENT_MODERATE),
      }),
    );
    return { comment: this.mapper.toProto(comment) };
  }

  async listPostComments(
    request: ListPostCommentsRequest,
  ): Promise<ListPostCommentsResponse> {
    const comments = unwrap(
      await this.listPostCommentsUseCase.execute({
        post_id: parseId(request.post_id, 'post_id'),
      }),
    );
    return { comments: comments.map((item) => this.mapper.toProto(item)) };
  }

  async listCommentsByStatus(
    request: ListCommentsByStatusRequest,
  ): Promise<ListCommentsByStatusResponse> {
    requirePermission(this.actors.current(), BlogPermission.COMMENT_MODERATE);
    const comments = unwrap(
      await this.listCommentsByStatusUseCase.execute({
        status: mapEnum(COMMENT_STATUS_FROM_GRPC, request.status, 'status'),
        limit: request.limit,
        offset: request.offset,
      }),
    );
    return { comments: comments.map((item) => this.mapper.toProto(item)) };
  }
}
