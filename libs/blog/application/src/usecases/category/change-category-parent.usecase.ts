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
import type { ChangeCategoryParentInput } from '../../data/index.js';
import type { CategoryHierarchyService } from '../../services/index.js';

export class ChangeCategoryParentUseCase implements UseCase<
  ChangeCategoryParentInput,
  CategoryAnemic
> {
  constructor(
    private readonly factory: CategoryFactory,
    private readonly repository: CategoryRepository,
    private readonly hierarchy: CategoryHierarchyService,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(
    input: ChangeCategoryParentInput,
  ): Promise<Result<CategoryAnemic>> {
    const anemic = await this.repository.findById(input.id);
    if (!anemic) {
      return Result.fail(new NotFoundError('Category', input.id));
    }

    const category = this.factory.reconstitute(anemic);
    const changed = category.changeParent(input.parent_id);
    if (changed.isFailure) {
      return Result.fail(changed.error);
    }

    const parent = await this.hierarchy.validateParent(
      input.parent_id,
      input.id,
    );
    if (parent.isFailure) {
      return Result.fail(parent.error);
    }

    return this.persistence.persist(category, this.repository);
  }
}
