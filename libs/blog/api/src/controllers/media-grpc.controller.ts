import { Controller } from '@nestjs/common';
import {
  ConfirmMediaUploadUseCase,
  DeleteMediaUseCase,
  GetMediaUrlUseCase,
  GetMediaUseCase,
  ListMediaUseCase,
  RequestMediaUploadUseCase,
  RestoreMediaUseCase,
  UpdateMediaAltTextUseCase,
} from '@toxictoast/blog-application';
import {
  MediaServiceControllerMethods,
  type ConfirmMediaUploadRequest,
  type ConfirmMediaUploadResponse,
  type DeleteMediaRequest,
  type DeleteMediaResponse,
  type GetMediaRequest,
  type GetMediaResponse,
  type GetMediaUrlRequest,
  type GetMediaUrlResponse,
  type ListMediaRequest,
  type ListMediaResponse,
  type MediaServiceController,
  type RequestMediaUploadRequest,
  type RequestMediaUploadResponse,
  type RestoreMediaRequest,
  type RestoreMediaResponse,
  type UpdateMediaAltTextRequest,
  type UpdateMediaAltTextResponse,
} from '@toxictoast/contracts-grpc';
import { mapOptionalEnum, parseId, unwrap } from '@toxictoast/shared-grpc';
import { MediaGrpcMapper } from '../mappers/index.js';
import { MEDIA_STATUS_FROM_GRPC } from '../mappings/index.js';

@Controller()
@MediaServiceControllerMethods()
export class MediaGrpcController implements MediaServiceController {
  private readonly mapper = new MediaGrpcMapper();

  constructor(
    private readonly requestMediaUploadUseCase: RequestMediaUploadUseCase,
    private readonly confirmMediaUploadUseCase: ConfirmMediaUploadUseCase,
    private readonly updateMediaAltTextUseCase: UpdateMediaAltTextUseCase,
    private readonly deleteMediaUseCase: DeleteMediaUseCase,
    private readonly restoreMediaUseCase: RestoreMediaUseCase,
    private readonly getMediaUseCase: GetMediaUseCase,
    private readonly getMediaUrlUseCase: GetMediaUrlUseCase,
    private readonly listMediaUseCase: ListMediaUseCase,
  ) {}

  async requestMediaUpload(
    request: RequestMediaUploadRequest,
  ): Promise<RequestMediaUploadResponse> {
    const output = unwrap(
      await this.requestMediaUploadUseCase.execute({
        filename: request.filename,
        mime_type: request.mime_type,
        size: request.size,
        alt_text: request.alt_text ?? null,
      }),
    );
    return {
      media: this.mapper.toProto(output.media),
      upload_url: output.upload_url,
    };
  }

  async confirmMediaUpload(
    request: ConfirmMediaUploadRequest,
  ): Promise<ConfirmMediaUploadResponse> {
    const media = unwrap(
      await this.confirmMediaUploadUseCase.execute({ id: parseId(request.id) }),
    );
    return { media: this.mapper.toProto(media) };
  }

  async updateMediaAltText(
    request: UpdateMediaAltTextRequest,
  ): Promise<UpdateMediaAltTextResponse> {
    const media = unwrap(
      await this.updateMediaAltTextUseCase.execute({
        id: parseId(request.id),
        alt_text: request.alt_text ?? null,
      }),
    );
    return { media: this.mapper.toProto(media) };
  }

  async deleteMedia(request: DeleteMediaRequest): Promise<DeleteMediaResponse> {
    const media = unwrap(
      await this.deleteMediaUseCase.execute({ id: parseId(request.id) }),
    );
    return { media: this.mapper.toProto(media) };
  }

  async restoreMedia(
    request: RestoreMediaRequest,
  ): Promise<RestoreMediaResponse> {
    const media = unwrap(
      await this.restoreMediaUseCase.execute({ id: parseId(request.id) }),
    );
    return { media: this.mapper.toProto(media) };
  }

  async getMedia(request: GetMediaRequest): Promise<GetMediaResponse> {
    const media = unwrap(
      await this.getMediaUseCase.execute({
        id: parseId(request.id),
        withDeleted: request.with_deleted,
      }),
    );
    return { media: this.mapper.toProto(media) };
  }

  async getMediaUrl(request: GetMediaUrlRequest): Promise<GetMediaUrlResponse> {
    const output = unwrap(
      await this.getMediaUrlUseCase.execute({ id: parseId(request.id) }),
    );
    return { url: output.url, expires_in: output.expires_in };
  }

  async listMedia(request: ListMediaRequest): Promise<ListMediaResponse> {
    const media = unwrap(
      await this.listMediaUseCase.execute({
        status: mapOptionalEnum(
          MEDIA_STATUS_FROM_GRPC,
          request.status,
          'status',
        ),
        limit: request.limit,
        offset: request.offset,
        withDeleted: request.with_deleted,
      }),
    );
    return { media: media.map((item) => this.mapper.toProto(item)) };
  }
}
