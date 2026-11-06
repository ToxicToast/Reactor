import type { Result } from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  MediaAnemic,
  MediaDomain,
  MediaFactory,
  MediaRepository,
} from '@toxictoast/blog-domain';
import type { UpdateMediaAltTextInput } from '../../data/index.js';
import { createMediaEditor } from '../../functions/index.js';

export class UpdateMediaAltTextUseCase implements UseCase<
  UpdateMediaAltTextInput,
  MediaAnemic
> {
  private readonly editor: AggregateEditor<MediaAnemic, MediaDomain>;

  constructor(
    factory: MediaFactory,
    repository: MediaRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createMediaEditor(factory, repository, persistence);
  }

  execute(input: UpdateMediaAltTextInput): Promise<Result<MediaAnemic>> {
    return this.editor.change(input.id, (media) =>
      media.updateAltText(input.alt_text),
    );
  }
}
