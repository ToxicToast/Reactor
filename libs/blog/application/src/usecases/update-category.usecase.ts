import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryFactory,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { UpdateCategoryInput } from '../data/index.js';

export class UpdateCategoryUseCase implements UseCase<
  UpdateCategoryInput,
  CategoryAnemic
> {
  constructor(
    private readonly factory: CategoryFactory,
    private readonly repository: CategoryRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: UpdateCategoryInput): Promise<Result<CategoryAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Category', input.id));
    }

    const category = this.factory.reconstitute(anemic);
    const updated = category.updateCategory(input.title, input.description);
    if (updated.isFailure) {
      return Result.fail(updated.error);
    }

    return this.persistence.persist(category, this.repository);
  }
}
