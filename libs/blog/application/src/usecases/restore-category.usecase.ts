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

export class RestoreCategoryUseCase implements UseCase<
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

    if (anemic.parent_id !== null) {
      const parent = await this.repository.findById(anemic.parent_id);
      if (!parent) {
        return Result.fail(
          new ConflictError('Parent category is deleted, restore it first'),
        );
      }
    }

    const category = this.factory.reconstitute(anemic);
    category.restoreCategory();

    return this.persistence.persist(category, this.repository);
  }
}
