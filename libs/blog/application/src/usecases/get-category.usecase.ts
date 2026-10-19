import { NotFoundError, Result } from '@toxictoast/shared-kernel';
import type { UseCase } from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { CategoryIdInput } from '../data/index.js';

export class GetCategoryUseCase implements UseCase<
  CategoryIdInput,
  CategoryAnemic
> {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(input: CategoryIdInput): Promise<Result<CategoryAnemic>> {
    const anemic = await this.repository.findById(input.id, input.withDeleted);
    if (!anemic) {
      return Result.fail(new NotFoundError('Category', input.id));
    }
    return Result.ok(anemic);
  }
}
