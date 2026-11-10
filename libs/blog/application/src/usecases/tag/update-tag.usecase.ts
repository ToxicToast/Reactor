import type { Result } from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  TagAnemic,
  TagDomain,
  TagFactory,
  TagRepository,
} from '@toxictoast/blog-domain';
import type { UpdateTagInput } from '../../data/index.js';
import { createTagEditor } from '../../functions/index.js';

export class UpdateTagUseCase implements UseCase<UpdateTagInput, TagAnemic> {
  private readonly editor: AggregateEditor<TagAnemic, TagDomain>;

  constructor(
    factory: TagFactory,
    repository: TagRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createTagEditor(factory, repository, persistence);
  }

  execute(input: UpdateTagInput): Promise<Result<TagAnemic>> {
    return this.editor.change(input.id, (tag) => tag.updateTitle(input.title));
  }
}
