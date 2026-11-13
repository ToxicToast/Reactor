import type { Result } from '@toxictoast/shared-kernel';
import {
  INCLUDING_DELETED,
  type AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import type {
  TagAnemic,
  TagDomain,
  TagFactory,
  TagRepository,
} from '@toxictoast/blog-domain';
import type { TagIdInput } from '../../data/index.js';
import { createTagEditor } from '../../functions/index.js';

export class RestoreTagUseCase implements UseCase<TagIdInput, TagAnemic> {
  private readonly editor: AggregateEditor<TagAnemic, TagDomain>;

  constructor(
    factory: TagFactory,
    repository: TagRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createTagEditor(factory, repository, persistence);
  }

  execute(input: TagIdInput): Promise<Result<TagAnemic>> {
    return this.editor.change(
      input.id,
      (tag) => tag.restore(),
      INCLUDING_DELETED,
    );
  }
}
