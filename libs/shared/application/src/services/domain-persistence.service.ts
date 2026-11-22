import {
  type Anemic,
  type DomainEvent,
  Result,
} from '@toxictoast/shared-kernel';
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

  /** Schreibt nur, wenn das Aggregat Events ausgelöst hat – ohne Events gab es keine fachliche Änderung. */
  async persist<TAnemic extends Anemic>(
    domain: PersistableDomain<TAnemic>,
    repository: SaveRepository<TAnemic>,
  ): Promise<Result<TAnemic>> {
    const events = domain.toEvents();
    const anemic = domain.toAnemic();

    if (events.length === 0) {
      return Result.ok(anemic);
    }

    return Result.ok(await this.write(anemic, events, repository));
  }

  /** Schreibt immer, z. B. für Zähler ohne Event; vorhandene Events landen trotzdem in der Outbox. */
  async save<TAnemic extends Anemic>(
    domain: PersistableDomain<TAnemic>,
    repository: SaveRepository<TAnemic>,
  ): Promise<TAnemic> {
    const events = domain.toEvents();
    const anemic = domain.toAnemic();

    if (events.length === 0) {
      return repository.save(anemic);
    }

    return this.write(anemic, events, repository);
  }

  private write<TAnemic extends Anemic>(
    anemic: TAnemic,
    events: ReadonlyArray<DomainEvent>,
    repository: SaveRepository<TAnemic>,
  ): Promise<TAnemic> {
    return this.uow.run(async () => {
      const saved = await repository.save(anemic);
      await this.outbox.add(events);
      return saved;
    });
  }
}
