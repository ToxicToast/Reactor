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
  ChangeCategoryParentResponse,
  CreateCategoryResponse,
  DeleteCategoryResponse,
  GetCategoryResponse,
  ListCategoriesResponse,
  RestoreCategoryResponse,
  UpdateCategoryResponse,
} from '@toxictoast/contracts-grpc';
import type { Observable } from 'rxjs';
import {
  IdParamDto,
  ListQueryDto,
  WithDeletedQueryDto,
} from '../../common/dtos/index.js';
import { CategoryGateway } from './category.gateway.js';
import {
  CategoryListResponseDto,
  CategoryResponseDto,
  ChangeCategoryParentDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dtos/index.js';

@ApiTags('Blog · Categories')
@ApiBearerAuth()
@Controller('api/v1/blog/categories')
export class CategoryController {
  constructor(private readonly categories: CategoryGateway) {}

  @Get()
  @ApiOkResponse({ type: CategoryListResponseDto })
  list(@Query() query: ListQueryDto): Observable<ListCategoriesResponse> {
    return this.categories.list(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: CategoryResponseDto })
  get(
    @Param() { id }: IdParamDto,
    @Query() { with_deleted }: WithDeletedQueryDto,
  ): Observable<GetCategoryResponse> {
    return this.categories.get({ id, with_deleted });
  }

  @Post()
  @ApiCreatedResponse({ type: CategoryResponseDto })
  create(@Body() body: CreateCategoryDto): Observable<CreateCategoryResponse> {
    return this.categories.create(body);
  }

  @Patch(':id')
  @ApiOkResponse({ type: CategoryResponseDto })
  update(
    @Param() { id }: IdParamDto,
    @Body() body: UpdateCategoryDto,
  ): Observable<UpdateCategoryResponse> {
    return this.categories.update({ id, ...body });
  }

  @Put(':id/parent')
  @ApiOkResponse({ type: CategoryResponseDto })
  changeParent(
    @Param() { id }: IdParamDto,
    @Body() { parent_id }: ChangeCategoryParentDto,
  ): Observable<ChangeCategoryParentResponse> {
    return this.categories.changeParent({
      id,
      parent_id: parent_id ?? undefined,
    });
  }

  @Delete(':id')
  @ApiOkResponse({ type: CategoryResponseDto })
  delete(@Param() { id }: IdParamDto): Observable<DeleteCategoryResponse> {
    return this.categories.delete(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: CategoryResponseDto })
  restore(@Param() { id }: IdParamDto): Observable<RestoreCategoryResponse> {
    return this.categories.restore(id);
  }
}
