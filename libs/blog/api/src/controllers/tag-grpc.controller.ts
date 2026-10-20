import { Controller } from '@nestjs/common';
import {
  CreateTagUseCase,
  DeleteTagUseCase,
  GetTagUseCase,
  ListTagsUseCase,
  RestoreTagUseCase,
  UpdateTagUseCase,
} from '@toxictoast/blog-application';
import {
  TagServiceControllerMethods,
  type CreateTagRequest,
  type CreateTagResponse,
  type DeleteTagRequest,
  type DeleteTagResponse,
  type GetTagRequest,
  type GetTagResponse,
  type ListTagsRequest,
  type ListTagsResponse,
  type RestoreTagRequest,
  type RestoreTagResponse,
  type TagServiceController,
  type UpdateTagRequest,
  type UpdateTagResponse,
} from '@toxictoast/contracts-grpc';
import { parseId, unwrap } from '@toxictoast/shared-grpc';
import { TagGrpcMapper } from '../mappers/index.js';

@Controller()
@TagServiceControllerMethods()
export class TagGrpcController implements TagServiceController {
  private readonly mapper = new TagGrpcMapper();

  constructor(
    private readonly createTagUseCase: CreateTagUseCase,
    private readonly updateTagUseCase: UpdateTagUseCase,
    private readonly deleteTagUseCase: DeleteTagUseCase,
    private readonly restoreTagUseCase: RestoreTagUseCase,
    private readonly getTagUseCase: GetTagUseCase,
    private readonly listTagsUseCase: ListTagsUseCase,
  ) {}

  async createTag(request: CreateTagRequest): Promise<CreateTagResponse> {
    const tag = unwrap(
      await this.createTagUseCase.execute({ title: request.title }),
    );
    return { tag: this.mapper.toProto(tag) };
  }

  async updateTag(request: UpdateTagRequest): Promise<UpdateTagResponse> {
    const tag = unwrap(
      await this.updateTagUseCase.execute({
        id: parseId(request.id),
        title: request.title,
      }),
    );
    return { tag: this.mapper.toProto(tag) };
  }

  async deleteTag(request: DeleteTagRequest): Promise<DeleteTagResponse> {
    const tag = unwrap(
      await this.deleteTagUseCase.execute({ id: parseId(request.id) }),
    );
    return { tag: this.mapper.toProto(tag) };
  }

  async restoreTag(request: RestoreTagRequest): Promise<RestoreTagResponse> {
    const tag = unwrap(
      await this.restoreTagUseCase.execute({ id: parseId(request.id) }),
    );
    return { tag: this.mapper.toProto(tag) };
  }

  async getTag(request: GetTagRequest): Promise<GetTagResponse> {
    const tag = unwrap(
      await this.getTagUseCase.execute({
        id: parseId(request.id),
        withDeleted: request.with_deleted,
      }),
    );
    return { tag: this.mapper.toProto(tag) };
  }

  async listTags(request: ListTagsRequest): Promise<ListTagsResponse> {
    const tags = unwrap(
      await this.listTagsUseCase.execute({
        limit: request.limit,
        offset: request.offset,
        withDeleted: request.with_deleted,
      }),
    );
    return { tags: tags.map((tag) => this.mapper.toProto(tag)) };
  }
}
