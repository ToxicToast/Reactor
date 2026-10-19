import type { DomainEvent } from '@toxictoast/shared-kernel';
import type { MediaAnemic } from '../anemics/index.js';

export class UpdateMediaEvent implements DomainEvent<MediaAnemic> {
  readonly event_namespace = 'blog.media';
  readonly event_name = 'update';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: MediaAnemic,
  ) {}
}
