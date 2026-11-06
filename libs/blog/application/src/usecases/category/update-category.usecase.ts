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
  CategoryRepository,
} from '@toxictoast/blog-domain';
import type { UpdateCategoryInput } from '../../data/index.js';
import { createCategoryEditor } from '../../functions/index.js';

export class UpdateCategoryUseCase implements UseCase<
  UpdateCategoryInput,
  CategoryAnemic
> {
  private readonly editor: AggregateEditor<CategoryAnemic, CategoryDomain>;

  constructor(
    factory: CategoryFactory,
    repository: CategoryRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createCategoryEditor(factory, repository, persistence);
  }

  execute(input: UpdateCategoryInput): Promise<Result<CategoryAnemic>> {
    return this.editor.change(input.id, (category) =>
      category.updateCategory(input.title, input.description),
    );
  }
}
