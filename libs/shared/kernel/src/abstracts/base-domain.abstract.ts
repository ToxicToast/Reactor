import { AggregateRoot } from './aggregate-root.abstract.js';
import type {
  Anemic,
  Domain,
  DomainContext,
  DomainEvent,
} from '../interfaces/index.js';
import type { Mutable, RaisableEvent } from '../types/index.js';

export abstract class BaseDomain<
  TAnemic extends Anemic,
  TPayload extends object = TAnemic,
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
   * The state the events of this aggregate carry. Aggregates map it
   * explicitly, so new internal fields do not leak into the event contract.
   */
  protected toEventPayload(): TPayload {
    return this.toAnemic() as unknown as TPayload;
  }

  protected get isDeleted(): boolean {
    return this.audit.deleted_at !== null;
  }

  protected touch(): void {
    this.audit.updated_at = this.ctx.date.now();
  }

  protected raise(event: RaisableEvent<TAnemic>): void {
    const eventId = this.ctx.id.generate();
    const occurredAt = this.ctx.date.now();

    if (typeof event === 'function') {
      this.addDomainEvent(
        new event(eventId, this.audit.id, occurredAt, this.toAnemic()),
      );
      return;
    }

    this.addDomainEvent({
      event_id: eventId,
      event_namespace: event.namespace,
      event_name: event.name,
      event_version: event.version,
      aggregate_id: this.audit.id,
      occurred_at: occurredAt,
      payload: this.toEventPayload(),
    });
  }

  protected markDeleted(event: RaisableEvent<TAnemic>): void {
    if (this.isDeleted) {
      return;
    }
    this.audit.deleted_at = this.ctx.date.now();
    this.touch();
    this.raise(event);
  }

  protected markRestored(event: RaisableEvent<TAnemic>): void {
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
