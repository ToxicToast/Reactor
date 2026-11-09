import { Result } from '@toxictoast/shared-kernel';
import {
  INCLUDING_DELETED,
  type AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryDomain,
  CategoryFactory,
  CategoryHierarchyService,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { CategoryIdInput } from '../../data/index.js';
import { createCategoryEditor } from '../../functions/index.js';

export class DeleteCategoryUseCase implements UseCase<
  CategoryIdInput,
  CategoryAnemic
> {
  private readonly editor: AggregateEditor<CategoryAnemic, CategoryDomain>;

  constructor(
    factory: CategoryFactory,
    repository: CategoryRepository,
    private readonly hierarchy: CategoryHierarchyService,
    persistence: DomainPersistence,
  ) {
    this.editor = createCategoryEditor(factory, repository, persistence);
  }

  execute(input: CategoryIdInput): Promise<Result<CategoryAnemic>> {
    return this.editor.change(
      input.id,
      (category, anemic) => this.delete(category, anemic),
      INCLUDING_DELETED,
    );
  }

  private async delete(
    category: CategoryDomain,
    anemic: CategoryAnemic,
  ): Promise<Result<void>> {
    const allowed = await this.hierarchy.validateDelete(anemic.id);
    if (allowed.isFailure) {
      return allowed;
    }

    category.deleteCategory();
    return Result.ok();
  }
}
