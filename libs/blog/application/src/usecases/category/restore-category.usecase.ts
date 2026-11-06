import { ConflictError, Result } from '@toxictoast/shared-kernel';
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
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { CategoryIdInput } from '../../data/index.js';
import { createCategoryEditor } from '../../functions/index.js';

export class RestoreCategoryUseCase implements UseCase<
  CategoryIdInput,
  CategoryAnemic
> {
  private readonly editor: AggregateEditor<CategoryAnemic, CategoryDomain>;

  constructor(
    factory: CategoryFactory,
    private readonly repository: CategoryRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createCategoryEditor(factory, repository, persistence);
  }

  execute(input: CategoryIdInput): Promise<Result<CategoryAnemic>> {
    return this.editor.change(
      input.id,
      (category, anemic) => this.restore(category, anemic),
      INCLUDING_DELETED,
    );
  }

  private async restore(
    category: CategoryDomain,
    anemic: CategoryAnemic,
  ): Promise<Result<void>> {
    if (anemic.parent_id !== null) {
      const parent = await this.repository.findById(anemic.parent_id);
      if (!parent) {
        return Result.fail(
          new ConflictError('Parent category is deleted, restore it first'),
        );
      }
    }

    category.restoreCategory();
    return Result.ok();
  }
}
