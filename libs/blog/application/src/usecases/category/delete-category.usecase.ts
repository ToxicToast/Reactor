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

export class DeleteCategoryUseCase implements UseCase<
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
      (category, anemic) => this.delete(category, anemic),
      INCLUDING_DELETED,
    );
  }

  private async delete(
    category: CategoryDomain,
    anemic: CategoryAnemic,
  ): Promise<Result<void>> {
    const children = await this.repository.findChildren(anemic.id);
    if (children.length > 0) {
      return Result.fail(
        new ConflictError(
          `Category has ${children.length} child repository and cannot be deleted`,
        ),
      );
    }

    category.deleteCategory();
    return Result.ok();
  }
}
