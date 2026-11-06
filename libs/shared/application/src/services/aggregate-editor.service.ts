import {
  type Anemic,
  NotFoundError,
  type Repository,
  Result,
} from '@toxictoast/shared-kernel';
import type {
  AggregateChange,
  AggregateChangeOptions,
  AggregateFactory,
  PersistableDomain,
} from '../interfaces/index.js';
import type { DomainPersistence } from './domain-persistence.service.js';

export class AggregateEditor<
  TAnemic extends Anemic,
  TDomain extends PersistableDomain<TAnemic>,
> {
  constructor(
    private readonly name: string,
    private readonly factory: AggregateFactory<TAnemic, TDomain>,
    private readonly repository: Repository<TAnemic>,
    private readonly persistence: DomainPersistence,
  ) {}

  async change(
    id: TAnemic['id'],
    change: AggregateChange<TAnemic, TDomain>,
    options: AggregateChangeOptions = {},
  ): Promise<Result<TAnemic>> {
    const anemic = await this.repository.findById(id, options.withDeleted);
    if (!anemic) {
      return Result.fail(new NotFoundError(this.name, id));
    }

    const domain = this.factory.reconstitute(anemic);
    const changed = await change(domain, anemic);
    if (changed instanceof Result && changed.isFailure) {
      return Result.fail(changed.error);
    }

    return this.persistence.persist(domain, this.repository);
  }
}
