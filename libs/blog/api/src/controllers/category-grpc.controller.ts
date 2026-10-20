import { Controller } from '@nestjs/common';
import {
  ChangeCategoryParentUseCase,
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoryUseCase,
  ListCategoriesUseCase,
  RestoreCategoryUseCase,
  UpdateCategoryUseCase,
} from '@toxictoast/blog-application';
import {
  CategoryServiceControllerMethods,
  type CategoryServiceController,
  type ChangeCategoryParentRequest,
  type ChangeCategoryParentResponse,
  type CreateCategoryRequest,
  type CreateCategoryResponse,
  type DeleteCategoryRequest,
  type DeleteCategoryResponse,
  type GetCategoryRequest,
  type GetCategoryResponse,
  type ListCategoriesRequest,
  type ListCategoriesResponse,
  type RestoreCategoryRequest,
  type RestoreCategoryResponse,
  type UpdateCategoryRequest,
  type UpdateCategoryResponse,
} from '@toxictoast/contracts-grpc';
import { parseId, parseOptionalId, unwrap } from '@toxictoast/shared-grpc';
import { CategoryGrpcMapper } from '../mappers/index.js';

@Controller()
@CategoryServiceControllerMethods()
export class CategoryGrpcController implements CategoryServiceController {
  private readonly mapper = new CategoryGrpcMapper();

  constructor(
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly changeCategoryParentUseCase: ChangeCategoryParentUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly restoreCategoryUseCase: RestoreCategoryUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
  ) {}

  async createCategory(
    request: CreateCategoryRequest,
  ): Promise<CreateCategoryResponse> {
    const category = unwrap(
      await this.createCategoryUseCase.execute({
        title: request.title,
        description: request.description ?? null,
        parent_id: parseOptionalId(request.parent_id, 'parent_id'),
      }),
    );
    return { category: this.mapper.toProto(category) };
  }

  async updateCategory(
    request: UpdateCategoryRequest,
  ): Promise<UpdateCategoryResponse> {
    const category = unwrap(
      await this.updateCategoryUseCase.execute({
        id: parseId(request.id),
        title: request.title,
        description: request.description ?? null,
      }),
    );
    return { category: this.mapper.toProto(category) };
  }

  async changeCategoryParent(
    request: ChangeCategoryParentRequest,
  ): Promise<ChangeCategoryParentResponse> {
    const category = unwrap(
      await this.changeCategoryParentUseCase.execute({
        id: parseId(request.id),
        parent_id: parseOptionalId(request.parent_id, 'parent_id'),
      }),
    );
    return { category: this.mapper.toProto(category) };
  }

  async deleteCategory(
    request: DeleteCategoryRequest,
  ): Promise<DeleteCategoryResponse> {
    const category = unwrap(
      await this.deleteCategoryUseCase.execute({ id: parseId(request.id) }),
    );
    return { category: this.mapper.toProto(category) };
  }

  async restoreCategory(
    request: RestoreCategoryRequest,
  ): Promise<RestoreCategoryResponse> {
    const category = unwrap(
      await this.restoreCategoryUseCase.execute({ id: parseId(request.id) }),
    );
    return { category: this.mapper.toProto(category) };
  }

  async getCategory(request: GetCategoryRequest): Promise<GetCategoryResponse> {
    const category = unwrap(
      await this.getCategoryUseCase.execute({
        id: parseId(request.id),
        withDeleted: request.with_deleted,
      }),
    );
    return { category: this.mapper.toProto(category) };
  }

  async listCategories(
    request: ListCategoriesRequest,
  ): Promise<ListCategoriesResponse> {
    const categories = unwrap(
      await this.listCategoriesUseCase.execute({
        limit: request.limit,
        offset: request.offset,
        withDeleted: request.with_deleted,
      }),
    );
    return {
      categories: categories.map((category) => {
        return this.mapper.toProto(category);
      }),
    };
  }
}
