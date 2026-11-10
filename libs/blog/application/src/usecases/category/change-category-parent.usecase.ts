import type { Result } from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  CategoryAnemic,
  CategoryDomain,
  CategoryFactory,
  CategoryHierarchyService,
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { ChangeCategoryParentInput } from '../../data/index.js';
import { createCategoryEditor } from '../../functions/index.js';

export class ChangeCategoryParentUseCase implements UseCase<
  ChangeCategoryParentInput,
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

  execute(input: ChangeCategoryParentInput): Promise<Result<CategoryAnemic>> {
    return this.editor.change(input.id, (category) =>
      this.changeParent(category, input),
    );
  }

  private async changeParent(
    category: CategoryDomain,
    input: ChangeCategoryParentInput,
  ): Promise<Result<void>> {
    const changed = category.changeParent(input.parent_id);
    if (changed.isFailure) {
      return changed;
    }

    return this.hierarchy.validateParent(input.parent_id, input.id);
  }
}
