import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type { Result } from '@toxictoast/shared-kernel';
import type {
  LinkAnemic,
  LinkDomain,
  LinkFactory,
  LinkRepository,
} from '@toxictoast/shortener-domain';
import type { UpdateLinkInput } from '../data/index.js';
import { createLinkEditor } from '../functions/index.js';

export class UpdateLinkUseCase implements UseCase<UpdateLinkInput, LinkAnemic> {
  private readonly editor: AggregateEditor<LinkAnemic, LinkDomain>;

  constructor(
    factory: LinkFactory,
    repository: LinkRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createLinkEditor(factory, repository, persistence);
  }

  execute(input: UpdateLinkInput): Promise<Result<LinkAnemic>> {
    return this.editor.change(input.id, (link) => {
      return link.update({
        target_url: input.target_url,
        description: input.description,
        active: input.active,
      });
    });
  }
}
