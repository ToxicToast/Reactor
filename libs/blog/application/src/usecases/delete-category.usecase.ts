import {
  ConflictError,
  NotFoundError,
  Result,
} from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryFactory,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { CategoryIdInput } from '../data/index.js';

export class DeleteCategoryUseCase implements UseCase<
  CategoryIdInput,
  CategoryAnemic
> {
  constructor(
    private readonly factory: CategoryFactory,
    private readonly repository: CategoryRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: CategoryIdInput): Promise<Result<CategoryAnemic>> {
    const anemic = await this.repository.findById(input.id, true);
    if (!anemic) {
      return Result.fail(new NotFoundError('Category', input.id));
    }

    const children = await this.repository.findChildren(input.id);
    if (children.length > 0) {
      return Result.fail(
        new ConflictError(
          `Category has ${children.length} child repository and cannot be deleted`,
        ),
      );
    }

    const category = this.factory.reconstitute(anemic);
    category.deleteCategory();

    return this.persistence.persist(category, this.repository);
  }
}
