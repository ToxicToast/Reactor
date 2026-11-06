import type { Result } from '@toxictoast/shared-kernel';
import {
  INCLUDING_DELETED,
  type AggregateEditor,
  type DomainPersistence,
  type UseCase,
} from '@toxictoast/shared-application';
import type {
  MediaAnemic,
  MediaDomain,
  MediaFactory,
  MediaRepository,
} from '@toxictoast/blog-domain';
import type { MediaIdInput } from '../../data/index.js';
import { createMediaEditor } from '../../functions/index.js';

export class RestoreMediaUseCase implements UseCase<MediaIdInput, MediaAnemic> {
  private readonly editor: AggregateEditor<MediaAnemic, MediaDomain>;

  constructor(
    factory: MediaFactory,
    repository: MediaRepository,
    persistence: DomainPersistence,
  ) {
    this.editor = createMediaEditor(factory, repository, persistence);
  }

  execute(input: MediaIdInput): Promise<Result<MediaAnemic>> {
    return this.editor.change(
      input.id,
      (media) => media.restoreMedia(),
      INCLUDING_DELETED,
    );
  }
}
