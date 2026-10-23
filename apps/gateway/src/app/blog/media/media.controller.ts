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
  ConfirmMediaUploadResponse,
  DeleteMediaResponse,
  GetMediaResponse,
  GetMediaUrlResponse,
  ListMediaResponse,
  RequestMediaUploadResponse,
  RestoreMediaResponse,
  UpdateMediaAltTextResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import { IdParamDto, WithDeletedQueryDto } from '../../common/dtos/index.js';
import {
  ListMediaQueryDto,
  MediaListResponseDto,
  MediaResponseDto,
  MediaUploadResponseDto,
  MediaUrlResponseDto,
  RequestMediaUploadDto,
  UpdateMediaAltTextDto,
} from './dtos/index.js';
import { MediaGateway } from './media.gateway.js';

@ApiTags('Blog · Media')
@ApiBearerAuth()
@Controller('api/v1/blog/media')
export class MediaController {
  constructor(private readonly media: MediaGateway) {}

  @Get()
  @ApiOkResponse({ type: MediaListResponseDto })
  list(@Query() query: ListMediaQueryDto): Observable<ListMediaResponse> {
    return this.media.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: MediaResponseDto })
  get(
    @Param() { id }: IdParamDto,
    @Query() { with_deleted }: WithDeletedQueryDto,
  ): Observable<GetMediaResponse> {
    return this.media.get({ id, with_deleted });
  }

  @Get(':id/url')
  @ApiOkResponse({ type: MediaUrlResponseDto })
  getUrl(@Param() { id }: IdParamDto): Observable<GetMediaUrlResponse> {
    return this.media.getUrl(id);
  }

  @Post()
  @ApiCreatedResponse({ type: MediaUploadResponseDto })
  requestUpload(
    @Body() body: RequestMediaUploadDto,
  ): Observable<RequestMediaUploadResponse> {
    return this.media.requestUpload(body);
  }

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MediaResponseDto })
  confirmUpload(
    @Param() { id }: IdParamDto,
  ): Observable<ConfirmMediaUploadResponse> {
    return this.media.confirmUpload(id);
  }

  @Patch(':id/alt-text')
  @ApiOkResponse({ type: MediaResponseDto })
  updateAltText(
    @Param() { id }: IdParamDto,
    @Body() { alt_text }: UpdateMediaAltTextDto,
  ): Observable<UpdateMediaAltTextResponse> {
    return this.media.updateAltText({ id, alt_text: alt_text ?? undefined });
  }

  @Delete(':id')
  @ApiOkResponse({ type: MediaResponseDto })
  delete(@Param() { id }: IdParamDto): Observable<DeleteMediaResponse> {
    return this.media.delete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MediaResponseDto })
  restore(@Param() { id }: IdParamDto): Observable<RestoreMediaResponse> {
    return this.media.restore(id);
  }
}
