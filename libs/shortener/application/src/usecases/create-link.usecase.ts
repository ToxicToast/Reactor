import type {
  DomainPersistence,
  UseCase,
} from '@toxictoast/shared-application';
import { Result } from '@toxictoast/shared-kernel';
import type {
  LinkAnemic,
  LinkFactory,
  LinkRepository,
} from '@toxictoast/shortener-domain';
import type { CreateLinkInput } from '../data/index.js';

export class CreateLinkUseCase implements UseCase<CreateLinkInput, LinkAnemic> {
  constructor(
    private readonly factory: LinkFactory,
    private readonly repository: LinkRepository,
    private readonly persistence: DomainPersistence,
  ) {}

  async execute(input: CreateLinkInput): Promise<Result<LinkAnemic>> {
    const created = this.factory.createDomain(input);
    if (created.isFailure) {
      return Result.fail(created.error);
    }
    return this.persistence.persist(created.value, this.repository);
  }
}
