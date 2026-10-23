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
  ArchivePostResponse,
  CreatePostResponse,
  DeletePostResponse,
  GetPostResponse,
  GetPublishedPostResponse,
  ListPostsResponse,
  PublishPostResponse,
  RestorePostResponse,
  UnarchivePostResponse,
  UpdatePostResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { IdParamDto, WithDeletedQueryDto } from '../../common/dtos/index.js';
import {
  CreatePostDto,
  ListPostsQueryDto,
  PostListResponseDto,
  PostResponseDto,
  PublishPostDto,
  SlugParamDto,
  UpdatePostDto,
} from './dtos/index.js';
import { updatePostRequest } from './functions/index.js';
import { PostGateway } from './post.gateway.js';

@ApiTags('Blog · Posts')
@ApiBearerAuth()
@Controller('api/v1/blog/posts')
export class PostController {
  constructor(private readonly posts: PostGateway) {}

  @Get()
  @ApiOkResponse({ type: PostListResponseDto })
  list(@Query() query: ListPostsQueryDto): Observable<ListPostsResponse> {
    return this.posts.list(query);
  }

  @Get('slug/:slug')
  @ApiOkResponse({ type: PostResponseDto })
  getPublished(
    @Param() { slug }: SlugParamDto,
  ): Observable<GetPublishedPostResponse> {
    return this.posts.getPublished(slug);
  }

  @Get(':id')
  @ApiOkResponse({ type: PostResponseDto })
  get(
    @Param() { id }: IdParamDto,
    @Query() { with_deleted }: WithDeletedQueryDto,
  ): Observable<GetPostResponse> {
    return this.posts.get({ id, with_deleted });
  }

  @Post()
  @ApiCreatedResponse({ type: PostResponseDto })
  create(@Body() body: CreatePostDto): Observable<CreatePostResponse> {
    return this.posts.create(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: PostResponseDto })
  update(
    @Param() { id }: IdParamDto,
    @Body() body: UpdatePostDto,
  ): Observable<UpdatePostResponse> {
    return this.posts.update(updatePostRequest(id, body));
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PostResponseDto })
  publish(
    @Param() { id }: IdParamDto,
    @Body() { published_at }: PublishPostDto,
  ): Observable<PublishPostResponse> {
    return this.posts.publish({ id, published_at });
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PostResponseDto })
  archive(@Param() { id }: IdParamDto): Observable<ArchivePostResponse> {
    return this.posts.archive(id);
  }

  @Post(':id/unarchive')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PostResponseDto })
  unarchive(@Param() { id }: IdParamDto): Observable<UnarchivePostResponse> {
    return this.posts.unarchive(id);
  }

  @Delete(':id')
  @ApiOkResponse({ type: PostResponseDto })
  delete(@Param() { id }: IdParamDto): Observable<DeletePostResponse> {
    return this.posts.delete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: PostResponseDto })
  restore(@Param() { id }: IdParamDto): Observable<RestorePostResponse> {
    return this.posts.restore(id);
  }
}
