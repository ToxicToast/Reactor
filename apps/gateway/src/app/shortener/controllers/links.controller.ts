import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type {
  CreateLinkResponse,
  DeleteLinkResponse,
  GetLinkResponse,
  ListLinksResponse,
  RestoreLinkResponse,
  UpdateLinkResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import {
  IdParamDto,
  ListQueryDto,
  WithDeletedQueryDto,
} from '../../common/dtos/index.js';
import {
  CreateLinkDto,
  LinkListResponseDto,
  LinkResponseDto,
  UpdateLinkDto,
} from '../dtos/index.js';
import { LinkGateway } from '../link.gateway.js';

@ApiTags('Admin · Shortener')
@ApiBearerAuth()
@Controller('api/v1/admin/shortener/links')
export class LinksController {
  constructor(private readonly links: LinkGateway) {}

  @Get()
  @ApiOkResponse({ type: LinkListResponseDto })
  list(@Query() query: ListQueryDto): Observable<ListLinksResponse> {
    return this.links.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: LinkResponseDto })
  get(
    @Param() { id }: IdParamDto,
    @Query() { with_deleted }: WithDeletedQueryDto,
  ): Observable<GetLinkResponse> {
    return this.links.get({ id, with_deleted });
  }

  @Post()
  @ApiCreatedResponse({ type: LinkResponseDto })
  create(@Body() body: CreateLinkDto): Observable<CreateLinkResponse> {
    return this.links.create(body);
  }

  @Put(':id')
  @ApiOkResponse({ type: LinkResponseDto })
  update(
    @Param() { id }: IdParamDto,
    @Body() body: UpdateLinkDto,
  ): Observable<UpdateLinkResponse> {
    return this.links.update({ id, ...body });
  }

  @Delete(':id')
  @ApiOkResponse({ type: LinkResponseDto })
  delete(@Param() { id }: IdParamDto): Observable<DeleteLinkResponse> {
    return this.links.delete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: LinkResponseDto })
  restore(@Param() { id }: IdParamDto): Observable<RestoreLinkResponse> {
    return this.links.restore(id);
  }
}
