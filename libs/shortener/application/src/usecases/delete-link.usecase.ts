import {
  INCLUDING_DELETED,
  type AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import type { Result } from '@toxictoast/shared-kernel';
import type {
  LinkAnemic,
  LinkDomain,
  LinkFactory,
  LinkRepository,
} from '@toxictoast/shortener-domain';
import type { LinkIdInput } from '../data/index.js';
import { createLinkEditor } from '../functions/index.js';

export class DeleteLinkUseCase implements UseCase<LinkIdInput, LinkAnemic> {
  private readonly editor: AggregateEditor<LinkAnemic, LinkDomain>;

  constructor(
    factory: LinkFactory,
    repository: LinkRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createLinkEditor(factory, repository, persistence);
  }

  execute(input: LinkIdInput): Promise<Result<LinkAnemic>> {
    return this.editor.change(
      input.id,
      (link) => link.delete(),
      INCLUDING_DELETED,
    );
  }
}
