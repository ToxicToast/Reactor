import { type Anemic, Result } from '@toxictoast/shared-kernel';
import type {
  Outbox,
  PersistableDomain,
  SaveRepository,
  UnitOfWork,
} from '../interfaces/index.js';

export class DomainPersistence {
  constructor(
    private readonly outbox: Outbox,
    private readonly uow: UnitOfWork,
  ) {}

  async persist<TAnemic extends Anemic>(
    domain: PersistableDomain<TAnemic>,
    repository: SaveRepository<TAnemic>,
  ): Promise<Result<TAnemic>> {
    const events = domain.toEvents();
    const anemic = domain.toAnemic();

    if (events.length === 0) {
      return Result.ok(anemic);
    }

    return this.uow.run(async () => {
      const saved = await repository.save(anemic);
      await this.outbox.add(events);
      return Result.ok(saved);
    });
  }
}
