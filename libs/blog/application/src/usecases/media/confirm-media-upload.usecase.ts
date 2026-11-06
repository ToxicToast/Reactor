import {
  ConflictError,
  Result,
  ValidationError,
} from '@toxictoast/shared-kernel';
import type {
  AggregateEditor,
  DomainPersistence,
  FileStorage,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  MediaAnemic,
  MediaDomain,
  MediaFactory,
  MediaRepository,
} from '@toxictoast/blog-domain';
import type { MediaIdInput } from '../../data/index.js';
import { createMediaEditor } from '../../functions/index.js';

export class ConfirmMediaUploadUseCase implements UseCase<
  MediaIdInput,
  MediaAnemic
> {
  private readonly editor: AggregateEditor<MediaAnemic, MediaDomain>;

  constructor(
    factory: MediaFactory,
    repository: MediaRepository,
    private readonly storage: FileStorage,
    persistence: DomainPersistence,
  ) {
    this.editor = createMediaEditor(factory, repository, persistence);
  }

  execute(input: MediaIdInput): Promise<Result<MediaAnemic>> {
    return this.editor.change(input.id, (media, anemic) =>
      this.markReady(media, anemic),
    );
  }

  private async markReady(
    media: MediaDomain,
    anemic: MediaAnemic,
  ): Promise<Result<void>> {
    const file = await this.storage.stat(anemic.object_key);
    if (!file) {
      return Result.fail(new ConflictError('File has not been uploaded yet'));
    }
    if (file.mime_type !== anemic.mime_type) {
      return Result.fail(
        new ValidationError(
          `Uploaded file is ${file.mime_type}, expected ${anemic.mime_type}`,
        ),
      );
    }

    return media.markReady(file.size);
  }
}
