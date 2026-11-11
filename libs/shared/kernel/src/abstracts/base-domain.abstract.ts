import { AggregateRoot } from './aggregate-root.abstract.js';
import type {
  Anemic,
  Domain,
  DomainContext,
  DomainEvent,
  DomainEventDefinition,
} from '../interfaces/index.js';
import type { Mutable } from '../types/index.js';

export abstract class BaseDomain<
  TAnemic extends Anemic,
  TPayload extends object = never,
>
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

  /**
   * The state the events of this aggregate carry. Every aggregate that raises
   * events maps it explicitly, so internal fields never leak into the event
   * contract.
   */
  protected toEventPayload(): TPayload {
    throw new Error(
      `${this.constructor.name} raises events but defines no event payload`,
    );
  }

  protected get isDeleted(): boolean {
    return this.audit.deleted_at !== null;
  }

  protected touch(): void {
    this.audit.updated_at = this.ctx.date.now();
  }

  protected raise(event: DomainEventDefinition): void {
    this.addDomainEvent({
      event_id: this.ctx.id.generate(),
      event_namespace: event.namespace,
      event_name: event.name,
      event_version: event.version,
      aggregate_id: this.audit.id,
      occurred_at: this.ctx.date.now(),
      payload: this.toEventPayload(),
    });
  }

  protected markDeleted(event: DomainEventDefinition): void {
    if (this.isDeleted) {
      return;
    }
    this.audit.deleted_at = this.ctx.date.now();
    this.touch();
    this.raise(event);
  }

  protected markRestored(event: DomainEventDefinition): void {
    if (!this.isDeleted) {
      return;
    }
    this.audit.deleted_at = null;
    this.touch();
    this.raise(event);
  }

  private get audit(): Mutable<Anemic> {
    return this.state as unknown as Mutable<Anemic>;
  }
}
