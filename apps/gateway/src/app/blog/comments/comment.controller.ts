import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreateCommentResponse,
  DeleteCommentResponse,
  GetCommentResponse,
  ListCommentsByStatusResponse,
  ListPostCommentsResponse,
  ModerateCommentResponse,
  RestoreCommentResponse,
  UpdateCommentResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { IdParamDto, WithDeletedQueryDto } from '../../common/dtos/index.js';
import { CommentGateway } from './comment.gateway.js';
import {
  CommentListResponseDto,
  CommentResponseDto,
  CreateCommentDto,
  ListCommentsByStatusQueryDto,
  ModerateCommentDto,
  UpdateCommentDto,
} from './dtos/index.js';

@ApiTags('Blog · Comments')
@ApiBearerAuth()
@Controller('api/v1/blog')
export class CommentController {
  constructor(private readonly comments: CommentGateway) {}

  @Get('posts/:id/comments')
  @ApiOkResponse({ type: CommentListResponseDto })
  listForPost(
    @Param() { id }: IdParamDto,
  ): Observable<ListPostCommentsResponse> {
    return this.comments.listForPost(id);
  }

  @Post('posts/:id/comments')
  @ApiCreatedResponse({ type: CommentResponseDto })
  create(
    @Param() { id }: IdParamDto,
    @Body() body: CreateCommentDto,
  ): Observable<CreateCommentResponse> {
    return this.comments.create({ post_id: id, ...body });
  }

  @Get('comments')
  @ApiOkResponse({ type: CommentListResponseDto })
  listByStatus(
    @Query() query: ListCommentsByStatusQueryDto,
  ): Observable<ListCommentsByStatusResponse> {
    return this.comments.listByStatus(query);
  }

  @Get('comments/:id')
  @ApiOkResponse({ type: CommentResponseDto })
  get(
    @Param() { id }: IdParamDto,
    @Query() { with_deleted }: WithDeletedQueryDto,
  ): Observable<GetCommentResponse> {
    return this.comments.get({ id, with_deleted });
  }

  @Patch('comments/:id')
  @ApiOkResponse({ type: CommentResponseDto })
  update(
    @Param() { id }: IdParamDto,
    @Body() { content }: UpdateCommentDto,
  ): Observable<UpdateCommentResponse> {
    return this.comments.update({ id, content });
  }

  @Post('comments/:id/moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CommentResponseDto })
  moderate(
    @Param() { id }: IdParamDto,
    @Body() body: ModerateCommentDto,
  ): Observable<ModerateCommentResponse> {
    return this.comments.moderate({ id, ...body });
  }

  @Delete('comments/:id')
  @ApiOkResponse({ type: CommentResponseDto })
  delete(@Param() { id }: IdParamDto): Observable<DeleteCommentResponse> {
    return this.comments.delete(id);
  }

  @Post('comments/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CommentResponseDto })
  restore(@Param() { id }: IdParamDto): Observable<RestoreCommentResponse> {
    return this.comments.restore(id);
  }
}
