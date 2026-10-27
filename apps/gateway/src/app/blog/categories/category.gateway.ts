import type { OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import {
  CATEGORY_SERVICE_NAME,
  type CategoryServiceClient,
  type ChangeCategoryParentRequest,
  type ChangeCategoryParentResponse,
  type CreateCategoryRequest,
  type CreateCategoryResponse,
  type DeleteCategoryResponse,
  type GetCategoryRequest,
  type GetCategoryResponse,
  type ListCategoriesRequest,
  type ListCategoriesResponse,
  type RestoreCategoryResponse,
  type UpdateCategoryRequest,
  type UpdateCategoryResponse,
} from '@toxictoast/contracts-grpc';
import type { Nullable } from '@toxictoast/shared-types';
import type { Observable } from 'rxjs';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class CategoryGateway implements OnModuleInit {
  private client: Nullable<CategoryServiceClient> = null;

  constructor(
    private readonly grpc: ClientGrpc,
    private readonly metadata: RequestMetadata,
  ) {}

  onModuleInit(): void {
    this.client = this.grpc.getService<CategoryServiceClient>(
      CATEGORY_SERVICE_NAME,
    );
  }

  create(request: CreateCategoryRequest): Observable<CreateCategoryResponse> {
    return this.categories().createCategory(request, this.metadata.current());
  }

  update(request: UpdateCategoryRequest): Observable<UpdateCategoryResponse> {
    return this.categories().updateCategory(request, this.metadata.current());
  }

  changeParent(
    request: ChangeCategoryParentRequest,
  ): Observable<ChangeCategoryParentResponse> {
    return this.categories().changeCategoryParent(
      request,
      this.metadata.current(),
    );
  }

  delete(id: string): Observable<DeleteCategoryResponse> {
    return this.categories().deleteCategory({ id }, this.metadata.current());
  }

  restore(id: string): Observable<RestoreCategoryResponse> {
    return this.categories().restoreCategory({ id }, this.metadata.current());
  }

  get(request: GetCategoryRequest): Observable<GetCategoryResponse> {
    return this.categories().getCategory(request, this.metadata.current());
  }

  list(request: ListCategoriesRequest): Observable<ListCategoriesResponse> {
    return this.categories().listCategories(request, this.metadata.current());
  }

  private categories(): CategoryServiceClient {
    if (!this.client) {
      throw new Error('Blog category client is not initialized');
    }
    return this.client;
  }
}
