import type { Optional } from '@toxictoast/shared-types';
import type { TagId } from '@toxictoast/blog-domain';

export interface UpdateTagInput {
  readonly id: TagId;
  readonly title: string;
}

export interface TagIdInput {
  readonly id: TagId;
  readonly withDeleted?: Optional<boolean>;
}

export interface ListTagsInput {
  readonly limit?: Optional<number>;
  readonly offset?: Optional<number>;
  readonly withDeleted?: Optional<boolean>;
}
