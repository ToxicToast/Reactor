import { AggregateRoot } from './aggregate-root.abstract.js';
import type {
  Anemic,
  Domain,
  DomainContext,
  DomainEvent,
} from '../interfaces/index.js';
import type { DomainEventClass, Mutable } from '../types/index.js';

export abstract class BaseDomain<TAnemic extends Anemic>
  extends AggregateRoot
  implements Domain<TAnemic>
{
  constructor(
    protected readonly state: Mutable<TAnemic>,
    protected readonly ctx: DomainContext,
  ) {
    super();
  }

  toAnemic(): TAnemic {
    return { ...this.state } as TAnemic;
  }

  toEvents(): Array<DomainEvent> {
    return this.pullDomainEvents();
  }

  protected get isDeleted(): boolean {
    return this.audit.deleted_at !== null;
  }

  protected touch(): void {
    this.audit.updated_at = this.ctx.date.now();
  }

  protected raise(EventClass: DomainEventClass<TAnemic>): void {
    this.addDomainEvent(
      new EventClass(
        this.ctx.id.generate(),
        this.audit.id,
        this.ctx.date.now(),
        this.toAnemic(),
      ),
    );
  }

  protected markDeleted(EventClass: DomainEventClass<TAnemic>): void {
    if (this.isDeleted) {
      return;
    }
    this.audit.deleted_at = this.ctx.date.now();
    this.touch();
    this.raise(EventClass);
  }

  protected markRestored(EventClass: DomainEventClass<TAnemic>): void {
    if (!this.isDeleted) {
      return;
    }
    this.audit.deleted_at = null;
    this.touch();
    this.raise(EventClass);
  }

  private get audit(): Mutable<Anemic> {
    return this.state as unknown as Mutable<Anemic>;
  }
}
