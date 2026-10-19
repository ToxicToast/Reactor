import { Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import { ListCategoriesInput } from '../data/index.js';

export class ListCategoriesUseCase implements UseCase<
  ListCategoriesInput,
  Array<CategoryAnemic>
> {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(
    input: ListCategoriesInput,
  ): Promise<Result<Array<CategoryAnemic>>> {
    const categories = await this.repository.findList(
      input.limit,
      input.offset,
      input.withDeleted,
    );
    return Result.ok(categories);
  }
}
