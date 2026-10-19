import { ConflictError, Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryData,
  CategoryFactory,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { CategoryHierarchyService } from '../../services/index.js';

export class CreateCategoryUseCase implements UseCase<
  CategoryData,
  CategoryAnemic
> {
  constructor(
    private readonly factory: CategoryFactory,
    private readonly repository: CategoryRepository,
    private readonly hierarchy: CategoryHierarchyService,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(data: CategoryData): Promise<Result<CategoryAnemic>> {
    const created = this.factory.createDomain(data);
    if (created.isFailure) {
      return Result.fail(created.error);
    }

    const category = created.value;
    const slug = category.toAnemic().slug;

    const existing = await this.repository.findBySlug(slug, true);
    if (existing) {
      return Result.fail(
        new ConflictError(`Category with slug "${slug}" already exists`),
      );
    }

    const parent = await this.hierarchy.validateParent(data.parent_id);
    if (parent.isFailure) {
      return Result.fail(parent.error);
    }

    return this.persistence.persist(category, this.repository);
  }
}
