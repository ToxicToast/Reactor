import { DomainEvent } from '@toxictoast/shared-kernel';
import { CategoryAnemic } from '../anemics/index.js';

export class RestoreCategoryEvent implements DomainEvent<CategoryAnemic> {
  readonly event_namespace = 'blog.category';
  readonly event_name = 'restore';
  readonly event_version = 1;

  constructor(
    readonly event_id: string,
    readonly aggregate_id: string,
    readonly occurred_at: Date,
    readonly payload: CategoryAnemic,
  ) {}
}
