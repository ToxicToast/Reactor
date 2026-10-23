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
  CreateTagResponse,
  DeleteTagResponse,
  GetTagResponse,
  ListTagsResponse,
  RestoreTagResponse,
  UpdateTagResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import {
  IdParamDto,
  ListQueryDto,
  WithDeletedQueryDto,
} from '../../common/dtos/index.js';
import {
  CreateTagDto,
  TagListResponseDto,
  TagResponseDto,
  UpdateTagDto,
} from './dtos/index.js';
import { TagGateway } from './tag.gateway.js';

@ApiTags('Blog · Tags')
@ApiBearerAuth()
@Controller('api/v1/blog/tags')
export class TagController {
  constructor(private readonly tags: TagGateway) {}

  @Get()
  @ApiOkResponse({ type: TagListResponseDto })
  list(@Query() query: ListQueryDto): Observable<ListTagsResponse> {
    return this.tags.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: TagResponseDto })
  get(
    @Param() { id }: IdParamDto,
    @Query() { with_deleted }: WithDeletedQueryDto,
  ): Observable<GetTagResponse> {
    return this.tags.get({ id, with_deleted });
  }

  @Post()
  @ApiCreatedResponse({ type: TagResponseDto })
  create(@Body() body: CreateTagDto): Observable<CreateTagResponse> {
    return this.tags.create(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: TagResponseDto })
  update(
    @Param() { id }: IdParamDto,
    @Body() body: UpdateTagDto,
  ): Observable<UpdateTagResponse> {
    return this.tags.update({ id, ...body });
  }

  @Delete(':id')
  @ApiOkResponse({ type: TagResponseDto })
  delete(@Param() { id }: IdParamDto): Observable<DeleteTagResponse> {
    return this.tags.delete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: TagResponseDto })
  restore(@Param() { id }: IdParamDto): Observable<RestoreTagResponse> {
    return this.tags.restore(id);
  }
}
