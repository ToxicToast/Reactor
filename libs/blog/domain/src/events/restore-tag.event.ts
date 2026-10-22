import { DomainEvent } from '@toxictoast/shared-kernel';
import { TagAnemic } from '../anemics/index.js';

export class RestoreTagEvent implements DomainEvent<TagAnemic> {
  readonly event_namespace = 'blog.tag';
  readonly event_name = 'restore';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: TagAnemic,
  ) {}
}
