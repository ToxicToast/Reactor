import { Result } from '@toxictoast/shared-kernel';
import type {
  DomainPersistence,
  FileStorage,
  UseCase,
} from '@toxictoast/shared-application';
import type {
  MediaData,
  MediaFactory,
  MediaRepository,
} from '@toxictoast/blog-domain';
import type { RequestMediaUploadOutput } from '../../data/index.js';

export class RequestMediaUploadUseCase implements UseCase<
  MediaData,
  RequestMediaUploadOutput
> {
  constructor(
    private readonly factory: MediaFactory,
    private readonly repository: MediaRepository,
    private readonly storage: FileStorage,
    private readonly persistence: DomainPersistence,
    private readonly uploadUrlTtl = 15 * 60,
  ) {}

  async execute(data: MediaData): Promise<Result<RequestMediaUploadOutput>> {
    const created = this.factory.createDomain(data);
    if (created.isFailure) {
      return Result.fail(created.error);
    }

    const saved = await this.persistence.persist(
      created.value,
      this.repository,
    );
    if (saved.isFailure) {
      return Result.fail(saved.error);
    }

    const uploadUrl = await this.storage.createUploadUrl(
      saved.value.object_key,
      saved.value.mime_type,
      this.uploadUrlTtl,
    );

    return Result.ok({ media: saved.value, upload_url: uploadUrl });
  }
}
