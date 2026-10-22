import type { DomainEvent } from '../interfaces/index.js';

export abstract class AggregateRoot<T extends DomainEvent = DomainEvent> {
  private readonly domainEvents: Array<T> = [];

  protected addDomainEvent(event: T): void {
    this.domainEvents.push(event);
  }

  public pullDomainEvents(): Array<T> {
    return this.domainEvents.splice(0);
  }
}
