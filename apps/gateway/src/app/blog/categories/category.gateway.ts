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
import type { Observable } from 'rxjs';
import { GrpcGateway } from '../../grpc/abstracts/index.js';
import type { RequestMetadata } from '../../grpc/services/index.js';

export class CategoryGateway extends GrpcGateway<CategoryServiceClient> {
  constructor(grpc: ClientGrpc, metadata: RequestMetadata) {
    super(grpc, CATEGORY_SERVICE_NAME, metadata);
  }

  create(request: CreateCategoryRequest): Observable<CreateCategoryResponse> {
    return this.service.createCategory(request, this.metadata());
  }

  update(request: UpdateCategoryRequest): Observable<UpdateCategoryResponse> {
    return this.service.updateCategory(request, this.metadata());
  }

  changeParent(
    request: ChangeCategoryParentRequest,
  ): Observable<ChangeCategoryParentResponse> {
    return this.service.changeCategoryParent(request, this.metadata());
  }

  delete(id: string): Observable<DeleteCategoryResponse> {
    return this.service.deleteCategory({ id }, this.metadata());
  }

  restore(id: string): Observable<RestoreCategoryResponse> {
    return this.service.restoreCategory({ id }, this.metadata());
  }

  get(request: GetCategoryRequest): Observable<GetCategoryResponse> {
    return this.service.getCategory(request, this.metadata());
  }

  list(request: ListCategoriesRequest): Observable<ListCategoriesResponse> {
    return this.service.listCategories(request, this.metadata());
  }
}
